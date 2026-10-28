import {
  User,
  UserRole,
  Product,
  PriceHistory,
  StockMovement,
  Lead,
  LeadStatus,
  FollowUp,
  Customer,
  Quotation,
  Order,
  PaymentRecord,
  Task,
  AuditLog,
} from '@/types/crm';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_PRICE_HISTORY,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_LEADS,
  INITIAL_FOLLOWUPS,
  INITIAL_CUSTOMERS,
  INITIAL_QUOTATIONS,
  INITIAL_ORDERS,
  INITIAL_TASKS,
  INITIAL_AUDIT_LOGS,
} from './initial-data';

const STORAGE_KEYS = {
  CURRENT_USER: 'systomech_crm_current_user',
  USERS: 'systomech_crm_users',
  PRODUCTS: 'systomech_crm_products',
  PRICE_HISTORY: 'systomech_crm_price_history',
  STOCK_MOVEMENTS: 'systomech_crm_stock_movements',
  LEADS: 'systomech_crm_leads',
  FOLLOWUPS: 'systomech_crm_followups',
  CUSTOMERS: 'systomech_crm_customers',
  QUOTATIONS: 'systomech_crm_quotations',
  ORDERS: 'systomech_crm_orders',
  TASKS: 'systomech_crm_tasks',
  AUDIT_LOGS: 'systomech_crm_audit_logs',
};

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getItem<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('systomech_crm_storage_change', { detail: { key } }));
  } catch (err) {
    console.error(`Failed to write ${key} to localStorage:`, err);
  }
}

export const crmStorage = {
  // Current User / Role session
  getCurrentUser(): User {
    return getItem<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  setCurrentUser(user: User): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
    this.addAuditLog('AUTH_SWITCH', 'settings', user.id, `Switched active session to ${user.name} (${user.role})`);
  },

  getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  // Products
  getProducts(): Product[] {
    const list = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
    let updated = false;
    const merged = list.map((p) => {
      const init = initialMap.get(p.id);
      if (init && (!p.imageUrl || !p.capacity)) {
        updated = true;
        return { ...p, imageUrl: p.imageUrl || init.imageUrl, capacity: p.capacity || init.capacity };
      }
      return p;
    });
    for (const init of INITIAL_PRODUCTS) {
      if (!merged.some((p) => p.id === init.id)) {
        merged.push(init);
        updated = true;
      }
    }
    if (updated && isClient()) {
      setItem(STORAGE_KEYS.PRODUCTS, merged);
    }
    return merged;
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },

  updateProduct(product: Product, reason?: string): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    const currentUser = this.getCurrentUser();

    if (index !== -1) {
      const oldProduct = products[index];
      // Price change audit rule
      if (oldProduct.price !== product.price) {
        const history: PriceHistory = {
          id: `ph-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          oldPrice: oldProduct.price,
          newPrice: product.price,
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date().toISOString(),
          reason: reason || 'Price updated in catalog master',
        };
        const histories = getItem<PriceHistory[]>(STORAGE_KEYS.PRICE_HISTORY, INITIAL_PRICE_HISTORY);
        histories.unshift(history);
        setItem(STORAGE_KEYS.PRICE_HISTORY, histories);

        this.addAuditLog(
          'PRICE_UPDATE',
          'product',
          product.id,
          `Price of ${product.name} changed from ₹${oldProduct.price.toLocaleString('en-IN')} to ₹${product.price.toLocaleString('en-IN')}`
        );
      }

      products[index] = { ...product, updatedAt: new Date().toISOString() };
      setItem(STORAGE_KEYS.PRODUCTS, products);
    }
  },

  addProduct(product: Omit<Product, 'id' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    setItem(STORAGE_KEYS.PRODUCTS, products);

    this.addAuditLog('PRODUCT_CREATE', 'product', newProduct.id, `Added new product ${newProduct.name} (${newProduct.sku})`);
    return newProduct;
  },

  getPriceHistory(): PriceHistory[] {
    return getItem<PriceHistory[]>(STORAGE_KEYS.PRICE_HISTORY, INITIAL_PRICE_HISTORY);
  },

  // Stock & Inventory Movements
  getStockMovements(): StockMovement[] {
    return getItem<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
  },

  recordStockMovement(movement: {
    productId: string;
    type: 'IN' | 'OUT' | 'ADJUST' | 'RETURN';
    quantity: number;
    referenceType: 'PO' | 'DISPATCH_ORDER' | 'STOCK_AUDIT' | 'SITE_RETURN' | 'INTERNAL';
    referenceId?: string;
    notes: string;
  }): { success: boolean; message: string; newStock?: number } {
    const products = this.getProducts();
    const pIndex = products.findIndex((p) => p.id === movement.productId);

    if (pIndex === -1) {
      return { success: false, message: 'Product not found' };
    }

    const product = products[pIndex];
    const previousStock = product.stock;
    let newStock = previousStock;

    if (movement.type === 'IN' || movement.type === 'RETURN') {
      newStock = previousStock + movement.quantity;
    } else if (movement.type === 'OUT') {
      if (previousStock < movement.quantity) {
        return {
          success: false,
          message: `Insufficient stock! Current available stock is ${previousStock} ${product.uom}, cannot dispatch ${movement.quantity} ${product.uom}.`,
        };
      }
      newStock = previousStock - movement.quantity;
    } else if (movement.type === 'ADJUST') {
      newStock = movement.quantity; // direct override for physical audit
    }

    // Update product stock balance
    product.stock = newStock;
    product.updatedAt = new Date().toISOString();
    products[pIndex] = product;
    setItem(STORAGE_KEYS.PRODUCTS, products);

    // Record movement ledger
    const currentUser = this.getCurrentUser();
    const movements = this.getStockMovements();
    const movementRecord: StockMovement = {
      id: `mov-${Date.now()}`,
      movementNumber: `MOV-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      type: movement.type,
      quantity: movement.quantity,
      previousStock,
      newStock,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      notes: movement.notes,
      performedBy: currentUser.id,
      performedByName: currentUser.name,
      timestamp: new Date().toISOString(),
    };
    movements.unshift(movementRecord);
    setItem(STORAGE_KEYS.STOCK_MOVEMENTS, movements);

    this.addAuditLog(
      `STOCK_${movement.type}`,
      'inventory',
      product.id,
      `${movement.type} movement of ${movement.quantity} ${product.uom} for ${product.name}. Stock updated from ${previousStock} to ${newStock}`
    );

    return { success: true, message: 'Stock movement recorded successfully', newStock };
  },

  // Leads
  getLeads(): Lead[] {
    return getItem<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  },

  addLead(leadData: Omit<Lead, 'id' | 'leadNumber' | 'createdAt' | 'updatedAt'>): Lead {
    const leads = this.getLeads();
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      leadNumber: `LEAD-2026-${String(leads.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leads.unshift(newLead);
    setItem(STORAGE_KEYS.LEADS, leads);

    this.addAuditLog('LEAD_CREATE', 'lead', newLead.id, `Created new lead: ${newLead.name} (${newLead.phone})`);
    return newLead;
  },

  updateLead(lead: Lead): void {
    const leads = this.getLeads();
    const idx = leads.findIndex((l) => l.id === lead.id);
    if (idx !== -1) {
      leads[idx] = { ...lead, updatedAt: new Date().toISOString() };
      setItem(STORAGE_KEYS.LEADS, leads);
    }
  },

  updateLeadStatus(leadId: string, status: LeadStatus): void {
    const leads = this.getLeads();
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      const prev = lead.status;
      lead.status = status;
      lead.updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.LEADS, leads);
      this.addAuditLog('LEAD_STATUS', 'lead', leadId, `Lead ${lead.name} moved from ${prev} to ${status}`);
    }
  },

  // Follow-ups
  getFollowUps(): FollowUp[] {
    return getItem<FollowUp[]>(STORAGE_KEYS.FOLLOWUPS, INITIAL_FOLLOWUPS);
  },

  addFollowUp(data: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp {
    const followups = this.getFollowUps();
    const newFup: FollowUp = {
      ...data,
      id: `fup-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    followups.unshift(newFup);
    setItem(STORAGE_KEYS.FOLLOWUPS, followups);

    // Also update lead's updatedAt
    const leads = this.getLeads();
    const lead = leads.find((l) => l.id === data.leadId);
    if (lead) {
      lead.updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.LEADS, leads);
    }

    this.addAuditLog('FOLLOWUP_LOG', 'lead', data.leadId, `Follow-up logged for ${data.leadName}: ${data.nextAction}`);
    return newFup;
  },

  markFollowUpDone(id: string): void {
    const followups = this.getFollowUps();
    const idx = followups.findIndex((f) => f.id === id);
    if (idx !== -1) {
      followups[idx].isDone = true;
      setItem(STORAGE_KEYS.FOLLOWUPS, followups);
    }
  },

  // Customers & Atomic Lead Conversion
  getCustomers(): Customer[] {
    return getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  convertLeadToCustomer(leadId: string): { success: boolean; customer?: Customer; message: string } {
    const leads = this.getLeads();
    const leadIdx = leads.findIndex((l) => l.id === leadId);
    if (leadIdx === -1) {
      return { success: false, message: 'Lead not found' };
    }

    const lead = leads[leadIdx];
    if (lead.status === 'converted' && lead.customerId) {
      return { success: false, message: 'Lead is already converted' };
    }

    const customers = this.getCustomers();
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      customerNumber: `CUST-2026-${String(customers.length + 1).padStart(3, '0')}`,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      pinCode: lead.pinCode,
      discom: lead.discom,
      consumerNumber: lead.consumerNumber || 'PENDING',
      sanctionLoadKw: lead.sanctionLoadKw || 5,
      connectionType: lead.connectionType === 'agricultural' ? 'commercial' : lead.connectionType,
      leadSourceId: lead.id,
      totalOrdersCount: 0,
      totalProjectValue: 0,
      createdAt: new Date().toISOString(),
    };

    customers.unshift(newCustomer);
    setItem(STORAGE_KEYS.CUSTOMERS, customers);

    lead.status = 'converted';
    lead.customerId = newCustomer.id;
    lead.updatedAt = new Date().toISOString();
    leads[leadIdx] = lead;
    setItem(STORAGE_KEYS.LEADS, leads);

    this.addAuditLog(
      'LEAD_CONVERT',
      'lead',
      lead.id,
      `Converted lead ${lead.name} to customer ${newCustomer.customerNumber}`
    );

    return { success: true, customer: newCustomer, message: 'Lead successfully converted to customer!' };
  },

  // Quotations
  getQuotations(): Quotation[] {
    return getItem<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
  },

  addQuotation(quoteData: Omit<Quotation, 'id' | 'quoteNumber' | 'revision' | 'createdAt' | 'updatedAt'>): Quotation {
    const quotes = this.getQuotations();
    const quoteNumber = `QT-2026-${String(quotes.length + 1).padStart(3, '0')}`;
    const newQuote: Quotation = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      quoteNumber,
      revision: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quotes.unshift(newQuote);
    setItem(STORAGE_KEYS.QUOTATIONS, quotes);

    this.addAuditLog('QUOTATION_CREATE', 'quotation', newQuote.id, `Generated quotation ${quoteNumber} for ${newQuote.customerName} (${newQuote.systemKw}kW)`);
    return newQuote;
  },

  createQuotationRevision(oldQuoteId: string, updates: Partial<Quotation>): Quotation | null {
    const quotes = this.getQuotations();
    const oldQuote = quotes.find((q) => q.id === oldQuoteId);
    if (!oldQuote) return null;

    const newRevision = (oldQuote.revision || 0) + 1;
    const revisedQuote: Quotation = {
      ...oldQuote,
      ...updates,
      id: `quote-${Date.now()}`,
      quoteNumber: `${oldQuote.quoteNumber.split('-R')[0]}-R${newRevision}`,
      revision: newRevision,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quotes.unshift(revisedQuote);
    setItem(STORAGE_KEYS.QUOTATIONS, quotes);

    this.addAuditLog('QUOTATION_REVISION', 'quotation', revisedQuote.id, `Created revision ${revisedQuote.quoteNumber} for quotation ${oldQuote.quoteNumber}`);
    return revisedQuote;
  },

  // Orders
  getOrders(): Order[] {
    return getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  createOrderFromQuotation(quotationId: string): { success: boolean; order?: Order; message: string } {
    const quotes = this.getQuotations();
    const quote = quotes.find((q) => q.id === quotationId);
    if (!quote) return { success: false, message: 'Quotation not found' };

    const orders = this.getOrders();
    const orderNumber = `ORD-2026-${String(orders.length + 1).padStart(3, '0')}`;
    const currentUser = this.getCurrentUser();

    let customerId = quote.customerId;
    if (!customerId) {
      const customers = this.getCustomers();
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        customerNumber: `CUST-2026-${String(customers.length + 1).padStart(3, '0')}`,
        name: quote.customerName,
        phone: quote.customerPhone,
        email: quote.customerEmail,
        address: quote.siteAddress,
        city: quote.city,
        state: 'Maharashtra',
        discom: quote.discom,
        consumerNumber: quote.consumerNumber || 'PENDING',
        sanctionLoadKw: quote.sanctionLoadKw,
        connectionType: 'residential',
        totalOrdersCount: 1,
        totalProjectValue: quote.totalGrossPrice,
        createdAt: new Date().toISOString(),
      };
      customers.unshift(newCust);
      setItem(STORAGE_KEYS.CUSTOMERS, customers);
      customerId = newCust.id;
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      quotationId: quote.id,
      quoteNumber: quote.quoteNumber,
      customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      siteAddress: quote.siteAddress,
      systemKw: quote.systemKw,
      totalOrderValue: quote.totalGrossPrice,
      subsidyExpected: quote.subsidyAmount,
      netCustomerPayable: quote.netPayableCustomer,
      totalPaid: 0,
      balanceDue: quote.totalGrossPrice,
      status: 'confirmed',
      payments: [],
      assignedFieldEngineerId: 'user-field-1',
      assignedFieldEngineerName: 'Amit Patil',
      notes: `Order created from approved quotation ${quote.quoteNumber}`,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    setItem(STORAGE_KEYS.ORDERS, orders);

    // Update quote status
    quote.status = 'accepted';
    setItem(STORAGE_KEYS.QUOTATIONS, quotes);

    this.addAuditLog('ORDER_CREATE', 'order', newOrder.id, `Created order ${orderNumber} for ${newOrder.customerName} (${newOrder.systemKw}kW)`);
    return { success: true, order: newOrder, message: 'Order created successfully!' };
  },

  recordPayment(orderId: string, payment: Omit<PaymentRecord, 'id' | 'orderId' | 'receiptNumber' | 'createdAt'>): { success: boolean; message: string } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    const receiptNumber = `RCPT-2026-${String(order.payments.length + 101).padStart(3, '0')}`;
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`,
      orderId,
      receiptNumber,
      createdAt: new Date().toISOString(),
    };

    order.payments.push(newPayment);
    order.totalPaid += payment.amount;
    order.balanceDue = Math.max(0, order.totalOrderValue - order.totalPaid);
    order.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.ORDERS, orders);

    this.addAuditLog(
      'PAYMENT_RECORD',
      'payment',
      orderId,
      `Recorded payment of ₹${payment.amount.toLocaleString('en-IN')} (${payment.method.toUpperCase()}) for order ${order.orderNumber}`
    );

    return { success: true, message: `Payment receipt ${receiptNumber} logged successfully.` };
  },

  updateOrderStatus(orderId: string, status: Order['status'], fieldNotes?: string): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      if (fieldNotes) {
        order.notes = `${order.notes || ''}\n[${new Date().toLocaleDateString('en-IN')}] ${fieldNotes}`;
      }
      if (status === 'commissioned') {
        order.commissionedAt = new Date().toISOString();
      }
      order.updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.ORDERS, orders);

      this.addAuditLog('ORDER_STATUS_UPDATE', 'order', orderId, `Updated status of ${order.orderNumber} to ${status}`);
    }
  },

  // Tasks
  getTasks(): Task[] {
    return getItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },

  addTask(taskData: Omit<Task, 'id' | 'taskNumber' | 'createdAt' | 'updatedAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      taskNumber: `TSK-2026-${String(tasks.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    setItem(STORAGE_KEYS.TASKS, tasks);

    this.addAuditLog('TASK_CREATE', 'task', newTask.id, `Assigned task ${newTask.taskNumber} to ${newTask.assignedToName}`);
    return newTask;
  },

  updateTaskStatus(
    taskId: string,
    status: Task['status'],
    notes?: string,
    stage?: Task['stage'],
    proofPhotos?: string[]
  ): void {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      if (notes) task.siteNotes = notes;
      if (stage) task.stage = stage;
      if (proofPhotos) task.proofPhotos = proofPhotos;
      if (status === 'completed') task.completedAt = new Date().toISOString();
      task.updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.TASKS, tasks);

      this.addAuditLog('TASK_UPDATE', 'task', taskId, `Task ${task.taskNumber} status set to ${status} (stage: ${stage || 'in progress'})`);
    }
  },

  toggleTaskChecklist(taskId: string, checkItemId: string): void {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const item = task.checklist.find((c) => c.id === checkItemId);
      if (item) {
        item.done = !item.done;
        task.updatedAt = new Date().toISOString();
        setItem(STORAGE_KEYS.TASKS, tasks);
      }
    }
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(action: string, entityType: AuditLog['entityType'], entityId: string, details: string): void {
    const currentUser = this.getCurrentUser();
    const logs = this.getAuditLogs();
    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(log);
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Reset to initial demo data
  resetAllData(): void {
    if (!isClient()) return;
    localStorage.clear();
    window.location.reload();
  },
};

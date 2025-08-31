// Admin paneli JavaScript kodi

// Autentifikatsiyani tekshirish
function checkAuth() {
    if (localStorage.getItem('adminAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Chiqish funksiyasi
function logout() {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = 'login.html';
}

// Ma'lumotlarni o'qish LocalStorage dan
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Ma'lumotlarni yangilash
function updateData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Dashboard statistikasini yangilash
function updateDashboard() {
    if (!checkAuth()) return;
    
    const orders = getData('orders');
    const completedOrders = getData('completedOrders');
    const freelancers = getData('freelancers');
    
    document.getElementById('ordersCount').textContent = orders.length;
    document.getElementById('completedCount').textContent = completedOrders.length;
    document.getElementById('freelancersCount').textContent = freelancers.length;
    
    // Pending jobs - statusi "pending" bo'lgan buyurtmalar
    const pendingOrders = orders.filter(order => order.status === 'pending');
    document.getElementById('pendingCount').textContent = pendingOrders.length;
}

// Buyurtmalarni yuklash
function loadOrders() {
    if (!checkAuth()) return;
    
    const orders = getData('orders');
    const ordersTable = document.getElementById('ordersTableBody');
    
    if (ordersTable) {
        ordersTable.innerHTML = '';
        
        if (orders.length === 0) {
            ordersTable.innerHTML = '<tr><td colspan="8" style="text-align: center;">No orders found</td></tr>';
            return;
        }
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.clientName || 'N/A'}</td>
                <td>${order.package || 'N/A'}</td>
                <td>${order.clientWhatsApp || 'N/A'}</td>
                <td>${order.clientEmail || 'N/A'}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td><span class="status status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
                <td>
                    <button class="action-btn btn-complete" data-id="${order.id}">Complete</button>
                    <button class="action-btn btn-view" data-id="${order.id}">View</button>
                    <button class="action-btn btn-delete" data-id="${order.id}">Delete</button>
                </td>
            `;
            
            ordersTable.appendChild(row);
        });
        
        // Harakatlar tugmalariga hodisa qo'shish
        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', function() {
                completeOrder(this.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                viewOrderDetails(this.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteOrder(this.getAttribute('data-id'));
            });
        });
    }
}

// Buyurtma tafsilotlarini ko'rsatish
function viewOrderDetails(orderId) {
    if (!checkAuth()) return;
    
    const orders = getData('orders');
    const order = orders.find(order => order.id == orderId);
    
    if (order) {
        const modal = document.getElementById('orderDetailsModal');
        const content = document.getElementById('orderDetailsContent');
        
        content.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Order ID</div>
                <div class="detail-value">#${order.id}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Client Name</div>
                <div class="detail-value">${order.clientName || 'N/A'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Service Package</div>
                <div class="detail-value">${order.package || 'N/A'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Contact Information</div>
                <div class="contact-info-full">
                    <div><i class="fas fa-phone"></i> ${order.clientWhatsApp || 'N/A'}</div>
                    <div><i class="fas fa-envelope"></i> ${order.clientEmail || 'N/A'}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Order Date</div>
                <div class="detail-value">${new Date(order.date).toLocaleDateString()}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value"><span class="status status-${order.status || 'pending'}">${order.status || 'pending'}</span></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Additional Message</div>
                <div class="detail-value">${order.clientMessage || 'No additional message'}</div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
}

// Buyurtmani bajarilgan deb belgilash
function completeOrder(orderId) {
    if (!checkAuth()) return;
    
    const orders = getData('orders');
    const orderIndex = orders.findIndex(order => order.id == orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'completed';
        updateData('orders', orders);
        
        // Bajarilgan buyurtmalar ro'yxatiga qo'shish
        const completedOrders = getData('completedOrders');
        orders[orderIndex].completedDate = new Date().toISOString();
        completedOrders.push(orders[orderIndex]);
        updateData('completedOrders', completedOrders);
        
        // Buyurtmani asosiy ro'yxatdan o'chirish
        orders.splice(orderIndex, 1);
        updateData('orders', orders);
        
        alert('Order marked as completed!');
        loadOrders();
        loadCompletedOrders();
        updateDashboard();
    }
}

// Buyurtmani o'chirish
function deleteOrder(orderId) {
    if (!checkAuth()) return;
    
    if (confirm('Are you sure you want to delete this order?')) {
        const orders = getData('orders');
        const updatedOrders = orders.filter(order => order.id != orderId);
        updateData('orders', updatedOrders);
        
        alert('Order deleted successfully!');
        loadOrders();
        updateDashboard();
    }
}

// Bajarilgan buyurtmalarni yuklash
function loadCompletedOrders() {
    if (!checkAuth()) return;
    
    const orders = getData('completedOrders');
    const ordersTable = document.getElementById('completedTableBody');
    
    if (ordersTable) {
        ordersTable.innerHTML = '';
        
        if (orders.length === 0) {
            ordersTable.innerHTML = '<tr><td colspan="8" style="text-align: center;">No completed orders found</td></tr>';
            return;
        }
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.clientName || 'N/A'}</td>
                <td>${order.package || 'N/A'}</td>
                <td>${order.clientWhatsApp || 'N/A'}</td>
                <td>${order.clientEmail || 'N/A'}</td>
                <td>${order.completedDate ? new Date(order.completedDate).toLocaleDateString() : 'N/A'}</td>
                <td><span class="status status-completed">Completed</span></td>
                <td>
                    <button class="action-btn btn-view" data-id="${order.id}">View</button>
                </td>
            `;
            
            ordersTable.appendChild(row);
        });
        
        // Ko'rish tugmalariga hodisa qo'shish
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                viewCompletedOrderDetails(this.getAttribute('data-id'));
            });
        });
    }
}

// Bajarilgan buyurtma tafsilotlarini ko'rsatish
function viewCompletedOrderDetails(orderId) {
    if (!checkAuth()) return;
    
    const orders = getData('completedOrders');
    const order = orders.find(order => order.id == orderId);
    
    if (order) {
        const modal = document.getElementById('orderDetailsModal');
        const content = document.getElementById('orderDetailsContent');
        
        content.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Order ID</div>
                <div class="detail-value">#${order.id}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Client Name</div>
                <div class="detail-value">${order.clientName || 'N/A'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Service Package</div>
                <div class="detail-value">${order.package || 'N/A'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Contact Information</div>
                <div class="contact-info-full">
                    <div><i class="fas fa-phone"></i> ${order.clientWhatsApp || 'N/A'}</div>
                    <div><i class="fas fa-envelope"></i> ${order.clientEmail || 'N/A'}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Order Date</div>
                <div class="detail-value">${new Date(order.date).toLocaleDateString()}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Completed Date</div>
                <div class="detail-value">${order.completedDate ? new Date(order.completedDate).toLocaleDateString() : 'N/A'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value"><span class="status status-completed">Completed</span></div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Additional Message</div>
                <div class="detail-value">${order.clientMessage || 'No additional message'}</div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
}

// Freelancerlarni yuklash
function loadFreelancers() {
    if (!checkAuth()) return;
    
    const freelancers = getData('freelancers');
    const freelancersTable = document.getElementById('freelancersTableBody');
    
    if (freelancersTable) {
        freelancersTable.innerHTML = '';
        
        if (freelancers.length === 0) {
            freelancersTable.innerHTML = '<tr><td colspan="8" style="text-align: center;">No freelancers found</td></tr>';
            return;
        }
        
        freelancers.forEach(freelancer => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>#F${freelancer.id}</td>
                <td>${freelancer.freelancerName || 'N/A'}</td>
                <td>${freelancer.freelancerCountry || 'N/A'}</td>
                <td>${freelancer.freelancerWhatsApp || 'N/A'}</td>
                <td>${freelancer.freelancerEmail || 'N/A'}</td>
                <td>${freelancer.freelancerSpecialty || 'N/A'}</td>
                <td>${new Date(freelancer.date).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn btn-view" data-id="${freelancer.id}">View</button>
                    <button class="action-btn btn-delete" data-id="${freelancer.id}">Delete</button>
                </td>
            `;
            
            freelancersTable.appendChild(row);
        });
        
        // Harakatlar tugmalariga hodisa qo'shish
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                viewFreelancerDetails(this.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteFreelancer(this.getAttribute('data-id'));
            });
        });
    }
}

// Freelancer tafsilotlarini ko'rsatish
function viewFreelancerDetails(freelancerId) {
    if (!checkAuth()) return;
    
    const freelancers = getData('freelancers');
    const freelancer = freelancers.find(f => f.id == freelancerId);
    
    if (freelancer) {
        const modal = document.getElementById('freelancerDetailsModal');
        const content = document.getElementById('freelancerDetailsContent');
        
        content.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Freelancer ID</div>
                <div class="detail-value">#F${freelancer.id}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Full Name</div>
                <div class="detail-value">${freelancer.freelancerName || 'N/A'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Country</div>
                <div class="detail-value">${freelancer.freelancerCountry || 'N/A'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Contact Information</div>
                <div class="contact-info-full">
                    <div><i class="fas fa-phone"></i> ${freelancer.freelancerWhatsApp || 'N/A'}</div>
                    <div><i class="fas fa-envelope"></i> ${freelancer.freelancerEmail || 'N/A'}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Languages</div>
                <div class="detail-value">${freelancer.freelancerLanguages || 'N/A'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Specialty</div>
                <div class="detail-value">${freelancer.freelancerSpecialty || 'N/A'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Join Date</div>
                <div class="detail-value">${new Date(freelancer.date).toLocaleDateString()}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">About</div>
                <div class="detail-value">${freelancer.freelancerAbout || 'No information provided'}</div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
}

// Freelancerni o'chirish
function deleteFreelancer(freelancerId) {
    if (!checkAuth()) return;
    
    if (confirm('Are you sure you want to delete this freelancer?')) {
        const freelancers = getData('freelancers');
        const updatedFreelancers = freelancers.filter(f => f.id != freelancerId);
        updateData('freelancers', updatedFreelancers);
        
        alert('Freelancer deleted successfully!');
        loadFreelancers();
        updateDashboard();
    }
}

// Qidiruv funksiyasi
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const activeTab = document.querySelector('.tab-content.active').id;
            
            if (activeTab === 'orders') {
                filterTable('ordersTableBody', searchTerm);
            } else if (activeTab === 'completed') {
                filterTable('completedTableBody', searchTerm);
            } else if (activeTab === 'freelancers') {
                filterTable('freelancersTableBody', searchTerm);
            }
        });
    }
}

// Jadvalni filtrlash
function filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent || cells[j].innerText;
            if (cellText.toLowerCase().indexOf(searchTerm) > -1) {
                found = true;
                break;
            }
        }
        
        rows[i].style.display = found ? '' : 'none';
    }
}

// Tab almashish
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Load data for the active tab
            if (tabId === 'orders') {
                loadOrders();
            } else if (tabId === 'completed') {
                loadCompletedOrders();
            } else if (tabId === 'freelancers') {
                loadFreelancers();
            }
        });
    });
}

// Modalni yopish
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Sahifa yuklanganida ishga tushadigan funksiya
function init() {
    if (!checkAuth()) return;
    
    // Dastlabki ma'lumotlarni yuklash
    updateDashboard();
    loadOrders();
    loadCompletedOrders();
    loadFreelancers();
    
    // Tizimni sozlash
    setupTabs();
    setupSearch();
    setupModals();
}

// DOM kontent yuklanganida ishga tushirish
document.addEventListener('DOMContentLoaded', init);

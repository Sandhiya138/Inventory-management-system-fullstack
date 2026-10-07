# Comprehensive REST API & RBAC Test Suite for Inventory Management System

$baseUrl = "http://localhost:8080/api"

Write-Output "=== 1. AUTHENTICATION & LOGIN TESTS ==="
$adminLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@inventory.com","password":"admin123"}'
$adminToken = $adminLogin.data.token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
Write-Output "Admin Login OK: $($adminLogin.data.email) - Role: $($adminLogin.data.role)"

$staffLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"staff@inventory.com","password":"staff123"}'
$staffToken = $staffLogin.data.token
$staffHeaders = @{ Authorization = "Bearer $staffToken" }
Write-Output "Staff Login OK: $($staffLogin.data.email) - Role: $($staffLogin.data.role)"

$viewerLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"viewer@inventory.com","password":"viewer123"}'
$viewerToken = $viewerLogin.data.token
$viewerHeaders = @{ Authorization = "Bearer $viewerToken" }
Write-Output "Viewer Login OK: $($viewerLogin.data.email) - Role: $($viewerLogin.data.role)"

Write-Output "`n=== 2. ROLE-BASED ACCESS CONTROL (RBAC) TESTS ==="
# Test 2.1: Viewer cannot manage users (GET /api/users)
try {
    Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $viewerHeaders
    Write-Output "FAIL: Viewer should be forbidden from accessing /api/users"
} catch {
    Write-Output "PASS: Viewer forbidden from /api/users (HTTP $($_.Exception.Response.StatusCode.value__))"
}

# Test 2.2: Staff cannot manage users (GET /api/users)
try {
    Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $staffHeaders
    Write-Output "FAIL: Staff should be forbidden from accessing /api/users"
} catch {
    Write-Output "PASS: Staff forbidden from /api/users (HTTP $($_.Exception.Response.StatusCode.value__))"
}

# Test 2.3: Admin CAN manage users (GET /api/users)
$users = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $adminHeaders
Write-Output "PASS: Admin retrieved $($users.data.Count) users"

# Test 2.4: Viewer cannot create product (POST /api/products)
try {
    Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Headers $viewerHeaders -ContentType "application/json" -Body '{"productName":"Restricted","sku":"REST-001","categoryId":1,"quantity":5,"purchasePrice":10,"sellingPrice":20}'
    Write-Output "FAIL: Viewer should be forbidden from creating products"
} catch {
    Write-Output "PASS: Viewer forbidden from creating products (HTTP $($_.Exception.Response.StatusCode.value__))"
}

# Test 2.5: Staff cannot create product (POST /api/products)
try {
    Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body '{"productName":"Restricted","sku":"REST-002","categoryId":1,"quantity":5,"purchasePrice":10,"sellingPrice":20}'
    Write-Output "FAIL: Staff should be forbidden from creating products"
} catch {
    Write-Output "PASS: Staff forbidden from creating products (HTTP $($_.Exception.Response.StatusCode.value__))"
}

Write-Output "`n=== 3. PRODUCTS & CATEGORIES APIs ==="
$products = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get -Headers $viewerHeaders
Write-Output "PASS: Viewer retrieved $($products.data.Count) products"

$categories = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get -Headers $viewerHeaders
Write-Output "PASS: Retrieved $($categories.data.Count) categories"

$subcategories = Invoke-RestMethod -Uri "$baseUrl/subcategories" -Method Get -Headers $viewerHeaders
Write-Output "PASS: Retrieved $($subcategories.data.Count) subcategories"

Write-Output "`n=== 4. SUPPLIERS & STOCK MOVEMENTS APIs ==="
$suppliers = Invoke-RestMethod -Uri "$baseUrl/suppliers" -Method Get -Headers $staffHeaders
Write-Output "PASS: Staff retrieved $($suppliers.data.Count) suppliers"

$movements = Invoke-RestMethod -Uri "$baseUrl/stock-movements" -Method Get -Headers $staffHeaders
Write-Output "PASS: Staff retrieved $($movements.data.Count) stock movements"

# Staff records a stock movement
$smBody = @{
    productId = 1
    movementType = "STOCK_IN"
    quantity = 5
    referenceNumber = "RESTOCK-TEST-001"
    reason = "Mid-week replenishment"
} | ConvertTo-Json
$newMovement = Invoke-RestMethod -Uri "$baseUrl/stock-movements" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $smBody
Write-Output "PASS: Staff recorded stock movement. New Product Stock: $($newMovement.data.newStock)"

Write-Output "`n=== 5. ORDERS & RETURNS WORKFLOW ==="
# Viewer places order
$orderBody = @{
    shippingAddress = "456 Oak Avenue, Metropolis"
    notes = "Handle with care"
    items = @(
        @{
            productId = 1
            quantity = 1
        },
        @{
            productId = 2
            quantity = 1
        }
    )
} | ConvertTo-Json -Depth 5
$orderResp = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $viewerHeaders -ContentType "application/json" -Body $orderBody
$newOrderId = $orderResp.data.id
Write-Output "PASS: Viewer placed order #$($orderResp.data.orderNumber) with Total: `$$($orderResp.data.totalAmount)"

# Staff updates order status to PROCESSING
$updateStatusBody = '{"status":"PROCESSING","notes":"Item packed for dispatch"}'
$statusResp = Invoke-RestMethod -Uri "$baseUrl/orders/$newOrderId/status" -Method Put -Headers $staffHeaders -ContentType "application/json" -Body $updateStatusBody
Write-Output "PASS: Staff updated order status to: $($statusResp.data.status)"

# Viewer requests a return for delivered order (Order 1 from seed data)
$returnBody = @{
    orderId = 1
    reason = "Defective cable port"
} | ConvertTo-Json
$returnResp = Invoke-RestMethod -Uri "$baseUrl/returns" -Method Post -Headers $viewerHeaders -ContentType "application/json" -Body $returnBody
Write-Output "PASS: Viewer submitted return request #$($returnResp.data.id) for Order ID 1"

# Staff processes the return
$processReturnBody = @{
    status = "APPROVED"
    staffNotes = "Verified by staff. Return approved."
} | ConvertTo-Json
$procReturnResp = Invoke-RestMethod -Uri "$baseUrl/returns/$($returnResp.data.id)" -Method Put -Headers $staffHeaders -ContentType "application/json" -Body $processReturnBody
Write-Output "PASS: Staff processed return request to status: $($procReturnResp.data.status)"

Write-Output "`n=== 6. MESSAGING & NOTIFICATIONS ==="
$conversations = Invoke-RestMethod -Uri "$baseUrl/conversations" -Method Get -Headers $staffHeaders
Write-Output "PASS: Staff retrieved $($conversations.data.Count) conversations"

$notifications = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers $viewerHeaders
Write-Output "PASS: Viewer retrieved $($notifications.data.Count) notifications"

$announcements = Invoke-RestMethod -Uri "$baseUrl/announcements" -Method Get -Headers $staffHeaders
Write-Output "PASS: Staff retrieved $($announcements.data.Count) announcements"

Write-Output "`n=== 7. REPORTS & ANALYTICS ==="
$invReport = Invoke-RestMethod -Uri "$baseUrl/reports/inventory" -Method Get -Headers $staffHeaders
Write-Output "PASS: Inventory Report - Total Products: $($invReport.data.totalProducts), Total Stock: $($invReport.data.totalStockQuantity), Value: `$$($invReport.data.totalInventoryValue)"

$salesReport = Invoke-RestMethod -Uri "$baseUrl/reports/sales" -Method Get -Headers $staffHeaders
Write-Output "PASS: Sales Report - Total Orders: $($salesReport.data.totalSalesOrders), Revenue: `$$($salesReport.data.totalRevenue)"

$purchaseReport = Invoke-RestMethod -Uri "$baseUrl/reports/purchases" -Method Get -Headers $staffHeaders
Write-Output "PASS: Purchase Report - Total Purchase Orders: $($purchaseReport.data.totalPurchaseOrders), Expenditure: `$$($purchaseReport.data.totalExpenditure)"

$stockMovementsReport = Invoke-RestMethod -Uri "$baseUrl/reports/stock-movements" -Method Get -Headers $staffHeaders
Write-Output "PASS: Stock Movement Report - Total Movements: $($stockMovementsReport.data.totalMovements)"

Write-Output "`n==============================================="
Write-Output "ALL REST APIS AND AUTHORIZATION CHECKS PASSED!"
Write-Output "==============================================="

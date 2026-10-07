package com.inventory.management.config;

import com.inventory.management.model.*;
import com.inventory.management.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ReturnRepository returnRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.seed-demo-data:true}")
    private boolean seedDemoData;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!seedDemoData) {
            logger.info("SEED_DEMO_DATA is set to false. Skipping demo data initialization.");
            return;
        }

        if (userRepository.count() > 0) {
            logger.info("Database already contains data. Skipping sample data initialization.");
            return;
        }

        logger.info("Initializing comprehensive sample data for Inventory Management System...");

        // 1. Create Demo Users
        User admin = new User(
                "System Administrator",
                "admin@inventory.com",
                passwordEncoder.encode("admin123"),
                "+1-555-0100",
                Role.ADMIN,
                UserStatus.ACTIVE
        );

        User staff = new User(
                "Alex Inventory Manager",
                "staff@inventory.com",
                passwordEncoder.encode("staff123"),
                "+1-555-0101",
                Role.STAFF,
                UserStatus.ACTIVE
        );

        User viewer = new User(
                "Sarah Miller",
                "viewer@inventory.com",
                passwordEncoder.encode("viewer123"),
                "+1-555-0102",
                Role.VIEWER,
                UserStatus.ACTIVE
        );

        User customer = new User(
                "David Johnson",
                "customer@inventory.com",
                passwordEncoder.encode("viewer123"),
                "+1-555-0103",
                Role.VIEWER,
                UserStatus.ACTIVE
        );

        admin = userRepository.save(admin);
        staff = userRepository.save(staff);
        viewer = userRepository.save(viewer);
        customer = userRepository.save(customer);

        // 2. Create Categories & Subcategories
        Category electronics = new Category("Electronics", "Electronic consumer and office peripherals");
        Category computerAccessories = new Category("Computer Accessories", "Cables, chargers, adapters, and peripherals");
        Category officeEquipment = new Category("Office Equipment", "Workplace and conference equipment");
        Category furniture = new Category("Furniture", "Ergonomic seating, work tables, and storage units");
        Category stationery = new Category("Stationery", "Office supplies, paper, and writing instruments");

        electronics = categoryRepository.save(electronics);
        computerAccessories = categoryRepository.save(computerAccessories);
        officeEquipment = categoryRepository.save(officeEquipment);
        furniture = categoryRepository.save(furniture);
        stationery = categoryRepository.save(stationery);

        Subcategory monitors = subcategoryRepository.save(new Subcategory("Monitors", "Display units and visual accessories", electronics));
        Subcategory keyboards = subcategoryRepository.save(new Subcategory("Keyboards", "Mechanical and membrane keyboards", electronics));
        Subcategory mice = subcategoryRepository.save(new Subcategory("Mice", "Wired and wireless optical mice", electronics));
        Subcategory usbDevices = subcategoryRepository.save(new Subcategory("USB Devices", "Flash drives and USB hubs", electronics));
        Subcategory accessories = subcategoryRepository.save(new Subcategory("Accessories", "General electronics accessories", electronics));

        Subcategory cables = subcategoryRepository.save(new Subcategory("Cables", "HDMI, DisplayPort, and USB-C cables", computerAccessories));
        Subcategory chargers = subcategoryRepository.save(new Subcategory("Chargers", "Fast GaN chargers and power bricks", computerAccessories));
        Subcategory adapters = subcategoryRepository.save(new Subcategory("Adapters", "Multi-port adapters and converters", computerAccessories));
        Subcategory storageDevices = subcategoryRepository.save(new Subcategory("Storage Devices", "SSDs and external drives", computerAccessories));

        Subcategory printers = subcategoryRepository.save(new Subcategory("Printers", "Laser and inkjet multifunction printers", officeEquipment));
        Subcategory scanners = subcategoryRepository.save(new Subcategory("Scanners", "A4 document scanners", officeEquipment));
        Subcategory projectors = subcategoryRepository.save(new Subcategory("Projectors", "Conference and meeting projectors", officeEquipment));

        Subcategory chairs = subcategoryRepository.save(new Subcategory("Chairs", "Ergonomic mesh chairs and executive seating", furniture));
        Subcategory tables = subcategoryRepository.save(new Subcategory("Tables", "Height adjustable desks and conference tables", furniture));
        Subcategory cabinets = subcategoryRepository.save(new Subcategory("Cabinets", "File storage and locking mobile pedestals", furniture));

        Subcategory pens = subcategoryRepository.save(new Subcategory("Pens", "Gel and ballpoint writing sets", stationery));
        Subcategory notebooks = subcategoryRepository.save(new Subcategory("Notebooks", "Hardcover notebooks and pads", stationery));
        Subcategory files = subcategoryRepository.save(new Subcategory("Files", "Expanding folders and archive files", stationery));

        // 3. Create Suppliers
        Supplier s1 = supplierRepository.save(new Supplier("Apex Tech Supplies", "Sarah Connor", "sarah@apextech.com", "+1-555-0201", "100 Silicon Way, San Jose, CA"));
        Supplier s2 = supplierRepository.save(new Supplier("Global Office Direct", "Michael Scott", "michael@globaloffice.com", "+1-555-0202", "1725 Slough Ave, Scranton, PA"));
        Supplier s3 = supplierRepository.save(new Supplier("ErgoComfort Furniture Ltd", "Rachel Green", "rachel@ergocomfort.com", "+1-555-0203", "495 Broadway, New York, NY"));
        Supplier s4 = supplierRepository.save(new Supplier("Prime Logistics & Stationery", "Dwight Schrute", "dwight@primestationery.com", "+1-555-0204", "Scranton Industrial Park, PA"));

        // 4. Create 18+ Products with realistic quantities & stock statuses
        List<Product> products = new ArrayList<>();

        // HEALTHY Products
        Product p1 = new Product("UltraSharp 27-inch 4K Monitor", "ELEC-MON-001", "IPS 4K UHD color accurate display with USB-C 90W power delivery",
                electronics, monitors, 25, 5, 50, new BigDecimal("250.00"), new BigDecimal("399.99"), s1, null);

        Product p2 = new Product("Mechanical RGB Gaming Keyboard", "ELEC-KEY-002", "Hot-swappable mechanical switches with RGB backlight and aluminum frame",
                electronics, keyboards, 40, 10, 100, new BigDecimal("45.00"), new BigDecimal("89.99"), s1, null);

        // CRITICAL Product (Qty <= minStock / 2)
        Product p3 = new Product("Wireless Ergonomic Optical Mouse", "ELEC-MOU-003", "Rechargeable silent click vertical mouse with adjustable DPI",
                electronics, mice, 3, 8, 60, new BigDecimal("18.00"), new BigDecimal("34.99"), s1, null);

        // OUT_OF_STOCK Product (Qty = 0)
        Product p4 = new Product("SuperSpeed 128GB USB 3.2 Drive", "ELEC-USB-004", "Durable metal casing USB 3.2 Gen 1 with read speeds up to 400MB/s",
                electronics, usbDevices, 0, 15, 150, new BigDecimal("8.50"), new BigDecimal("19.99"), s1, null);

        // LOW_STOCK Product (Qty <= minStock)
        Product p5 = new Product("7-in-1 USB-C Hub Adapter", "COMP-ADP-005", "Multiport adapter with 4K HDMI, SD card reader, and 100W PD passthrough",
                computerAccessories, adapters, 6, 10, 80, new BigDecimal("22.00"), new BigDecimal("49.99"), s1, null);

        Product p6 = new Product("Braided Thunderbolt 4 Cable 2M", "COMP-CAB-006", "Certified 40Gbps high speed data transfer and 100W fast charging cable",
                computerAccessories, cables, 55, 15, 120, new BigDecimal("12.00"), new BigDecimal("24.99"), s1, null);

        Product p7 = new Product("65W GaN Fast Wall Charger", "COMP-CHG-007", "Compact 3-port fast wall charger with foldable pins for laptop and phone",
                computerAccessories, chargers, 30, 10, 90, new BigDecimal("15.00"), new BigDecimal("32.50"), s1, null);

        Product p8 = new Product("1TB NVMe M.2 Solid State Drive", "COMP-SSD-008", "PCIe 4.0 internal NVMe SSD with up to 7000MB/s read speeds",
                computerAccessories, storageDevices, 18, 5, 50, new BigDecimal("55.00"), new BigDecimal("99.99"), s1, null);

        Product p9 = new Product("High-Speed Duplex Laser Printer", "OFFC-PRN-009", "Monochrome wireless laser printer with auto double-sided printing",
                officeEquipment, printers, 8, 3, 25, new BigDecimal("180.00"), new BigDecimal("299.99"), s2, null);

        Product p10 = new Product("Flatbed Document Scanner A4", "OFFC-SCN-010", "High resolution 4800 x 4800 dpi flatbed optical scanner for receipts & docs",
                officeEquipment, scanners, 2, 4, 20, new BigDecimal("110.00"), new BigDecimal("179.99"), s2, null);

        Product p11 = new Product("Full HD Portable Projector 4000lm", "OFFC-PRJ-011", "Crisp 1080p LED conference projector with keystone correction and HDMI",
                officeEquipment, projectors, 12, 4, 30, new BigDecimal("320.00"), new BigDecimal("499.00"), s2, null);

        Product p12 = new Product("Mesh High-Back Ergonomic Office Chair", "FURN-CHR-012", "Breathable mesh chair with 3D armrests, lumbar support, and tilt lock",
                furniture, chairs, 14, 5, 40, new BigDecimal("130.00"), new BigDecimal("249.99"), s3, null);

        Product p13 = new Product("Motorized Dual-Motor Standing Desk", "FURN-TBL-013", "Electric height adjustable desk 55x28 inch with digital memory keypad",
                furniture, tables, 7, 3, 20, new BigDecimal("210.00"), new BigDecimal("389.99"), s3, null);

        Product p14 = new Product("3-Drawer Steel Mobile File Cabinet", "FURN-CAB-014", "Heavy duty under desk lockable pedestal cabinet with anti-tip wheels",
                furniture, cabinets, 9, 4, 30, new BigDecimal("75.00"), new BigDecimal("139.99"), s3, null);

        // EXPIRING_SOON Product (Expiry date within 30 days)
        Product p15 = new Product("Specialty Calibration Adhesive Strips", "STAT-PEN-015", "Temperature-sensitive industrial calibration tape for equipment testing",
                stationery, pens, 80, 20, 200, new BigDecimal("4.50"), new BigDecimal("12.99"), s4, LocalDate.now().plusDays(15));

        Product p16 = new Product("Premium Hardcover Dotted Journal", "STAT-NBK-016", "Acid-free 120gsm numbered pages notebook with ribbon bookmark and inner pocket",
                stationery, notebooks, 60, 15, 120, new BigDecimal("6.00"), new BigDecimal("15.50"), s4, null);

        Product p17 = new Product("Heavy-Duty Expanding File Folder", "STAT-FIL-017", "13-pocket accordion file organizer with customizable colored tab labels",
                stationery, files, 45, 10, 100, new BigDecimal("5.20"), new BigDecimal("11.99"), s4, null);

        // EXPIRED Product (Expiry date in the past)
        Product p18 = new Product("Thermal Printer Test Label Rolls", "STAT-LBL-018", "Time-sensitive direct thermal adhesive label test roll batch",
                stationery, files, 20, 10, 100, new BigDecimal("3.00"), new BigDecimal("7.99"), s4, LocalDate.now().minusDays(10));

        products.add(p1);
        products.add(p2);
        products.add(p3);
        products.add(p4);
        products.add(p5);
        products.add(p6);
        products.add(p7);
        products.add(p8);
        products.add(p9);
        products.add(p10);
        products.add(p11);
        products.add(p12);
        products.add(p13);
        products.add(p14);
        products.add(p15);
        products.add(p16);
        products.add(p17);
        products.add(p18);

        for (int i = 0; i < products.size(); i++) {
            Product savedP = productRepository.save(products.get(i));
            products.set(i, savedP);

            // Record initial stock movement for each product
            StockMovement movement = new StockMovement(
                    savedP,
                    StockMovementType.STOCK_IN,
                    savedP.getQuantity(),
                    0,
                    savedP.getQuantity(),
                    "INIT-" + savedP.getSku(),
                    "Initial warehouse intake",
                    admin
            );
            stockMovementRepository.save(movement);
        }

        // 5. Create 6 Realistic Sample Orders
        // Order 1: Delivered Sale Order
        Order o1 = new Order("ORD-20260901-1001", OrderType.SALE_ORDER, viewer, null, "123 Maple Street, Springfield", "Please leave package by the front door");
        o1.setStatus(OrderStatus.DELIVERED);
        o1.addOrderItem(new OrderItem(products.get(0), 1, products.get(0).getSellingPrice())); // Monitor
        o1.addOrderItem(new OrderItem(products.get(1), 1, products.get(1).getSellingPrice())); // Keyboard
        o1 = orderRepository.save(o1);

        // Stock movement for Order 1
        stockMovementRepository.save(new StockMovement(products.get(0), StockMovementType.SALE, 1, 26, 25, o1.getOrderNumber(), "Customer purchase", viewer));
        stockMovementRepository.save(new StockMovement(products.get(1), StockMovementType.SALE, 1, 41, 40, o1.getOrderNumber(), "Customer purchase", viewer));

        // Order 2: Shipped Sale Order
        Order o2 = new Order("ORD-20260905-1002", OrderType.SALE_ORDER, viewer, null, "123 Maple Street, Springfield", "Express shipping requested");
        o2.setStatus(OrderStatus.SHIPPED);
        o2.addOrderItem(new OrderItem(products.get(4), 2, products.get(4).getSellingPrice())); // USB Hub
        o2.addOrderItem(new OrderItem(products.get(5), 1, products.get(5).getSellingPrice())); // Cable
        o2 = orderRepository.save(o2);

        // Order 3: Processing Sale Order
        Order o3 = new Order("ORD-20260910-1003", OrderType.SALE_ORDER, customer, null, "742 Evergreen Terrace, Springfield", "Call upon arrival");
        o3.setStatus(OrderStatus.PROCESSING);
        o3.addOrderItem(new OrderItem(products.get(11), 1, products.get(11).getSellingPrice())); // Chair
        o3 = orderRepository.save(o3);

        // Order 4: Pending Sale Order
        Order o4 = new Order("ORD-20260915-1004", OrderType.SALE_ORDER, viewer, null, "123 Maple Street, Springfield", "Standard delivery");
        o4.setStatus(OrderStatus.PENDING);
        o4.addOrderItem(new OrderItem(products.get(8), 1, products.get(8).getSellingPrice())); // Printer
        o4 = orderRepository.save(o4);

        // Order 5: Purchase Order from Supplier
        Order o5 = new Order("PO-20260918-2001", OrderType.PURCHASE_ORDER, null, s1, "Warehouse Bay 3, Central Logistics Hub", "Restock bulk intake");
        o5.setStatus(OrderStatus.CONFIRMED);
        o5.addOrderItem(new OrderItem(products.get(5), 20, products.get(5).getPurchasePrice())); // Cables
        o5.addOrderItem(new OrderItem(products.get(6), 15, products.get(6).getPurchasePrice())); // Chargers
        o5 = orderRepository.save(o5);

        // Order 6: Cancelled Sale Order
        Order o6 = new Order("ORD-20260920-1005", OrderType.SALE_ORDER, customer, null, "742 Evergreen Terrace, Springfield", "Customer cancelled before packing");
        o6.setStatus(OrderStatus.CANCELLED);
        o6.addOrderItem(new OrderItem(products.get(9), 1, products.get(9).getSellingPrice())); // Scanner
        o6 = orderRepository.save(o6);

        // 6. Create Return Workflow Record
        ProductReturn return1 = new ProductReturn(o1, viewer, "Color calibration profile does not match company standard");
        return1.setStatus(ReturnStatus.APPROVED);
        return1.setStaffNotes("Approved by Alex Inventory Manager for warranty replacement.");
        return1.setProcessedBy(staff);
        return1.setProcessedDate(LocalDateTime.now().minusDays(2));
        returnRepository.save(return1);

        // 7. Create Messaging (ADMIN <-> STAFF, STAFF <-> VIEWER)
        // Admin <-> Staff
        Conversation convAdminStaff = new Conversation(
                "Warehouse Capacity & Restocking Q4",
                ConversationType.ADMIN_STAFF,
                admin,
                staff,
                null
        );
        convAdminStaff = conversationRepository.save(convAdminStaff);

        Message m1 = new Message(convAdminStaff, admin, "Alex, please review the low stock items on Electronics and prepare a restock purchase order.");
        m1.setIsRead(true);
        messageRepository.save(m1);

        Message m2 = new Message(convAdminStaff, staff, "Understood. I checked Apex Tech Supplies pricing and I'm drafting PO-20260918-2001 for approval.");
        m2.setIsRead(true);
        messageRepository.save(m2);

        Message m3 = new Message(convAdminStaff, admin, "Great. Make sure to also check the ergonomic chairs from ErgoComfort.");
        m3.setIsRead(false);
        messageRepository.save(m3);

        // Staff <-> Viewer
        Conversation convStaffViewer = new Conversation(
                "Inquiry regarding Order ORD-20260901-1001 Return",
                ConversationType.STAFF_VIEWER,
                staff,
                viewer,
                o1
        );
        convStaffViewer = conversationRepository.save(convStaffViewer);

        Message mv1 = new Message(convStaffViewer, viewer, "Hello Alex, I've requested a return for my monitor order. When will the courier pick it up?");
        mv1.setIsRead(true);
        messageRepository.save(mv1);

        Message mv2 = new Message(convStaffViewer, staff, "Hi Sarah! Your return has been approved. The courier will pick up the item tomorrow between 10 AM and 2 PM.");
        mv2.setIsRead(false);
        messageRepository.save(mv2);

        // 8. Create Announcements (Admin -> Staff)
        Announcement ann1 = new Announcement(
                "Q4 Physical Warehouse Stock Audit Scheduled",
                "All staff please note that our annual physical inventory count will take place next weekend. Please ensure all pending inbound shipments are logged before Friday 5 PM.",
                AnnouncementPriority.HIGH,
                admin
        );
        announcementRepository.save(ann1);

        Announcement ann2 = new Announcement(
                "New Supplier Onboarded: ErgoComfort Furniture Ltd",
                "We have finalized our wholesale supply terms with ErgoComfort Furniture Ltd. Direct purchase orders for desks and chairs can now be routed with 15% partner discount.",
                AnnouncementPriority.NORMAL,
                admin
        );
        announcementRepository.save(ann2);

        // 9. Create Notifications
        notificationRepository.save(new Notification(
                null,
                Role.STAFF,
                NotificationType.OUT_OF_STOCK,
                "Out of Stock: SuperSpeed 128GB USB 3.2 Drive",
                "Product SKU ELEC-USB-004 has reached 0 units in stock. Reorder immediately.",
                p4.getId()
        ));

        notificationRepository.save(new Notification(
                null,
                Role.STAFF,
                NotificationType.CRITICAL_STOCK,
                "Critical Stock: Wireless Ergonomic Optical Mouse",
                "Product SKU ELEC-MOU-003 only has 3 units remaining (minimum stock threshold is 8).",
                p3.getId()
        ));

        notificationRepository.save(new Notification(
                null,
                Role.STAFF,
                NotificationType.EXPIRING_PRODUCT,
                "Expiring Soon: Specialty Calibration Adhesive Strips",
                "Product SKU STAT-PEN-015 will expire in 15 days.",
                p15.getId()
        ));

        notificationRepository.save(new Notification(
                null,
                Role.STAFF,
                NotificationType.NEW_ORDER,
                "New Order Received: " + o4.getOrderNumber(),
                "Customer Sarah Miller placed a new order for total $" + o4.getTotalAmount(),
                o4.getId()
        ));

        notificationRepository.save(new Notification(
                viewer,
                null,
                NotificationType.ORDER_STATUS_CHANGED,
                "Order Dispatched: " + o2.getOrderNumber(),
                "Your order #ORD-20260905-1002 has been shipped and is on its way!",
                o2.getId()
        ));

        notificationRepository.save(new Notification(
                viewer,
                null,
                NotificationType.RETURN_REQUEST,
                "Return Request Approved: " + o1.getOrderNumber(),
                "Your return request for order ORD-20260901-1001 has been approved.",
                return1.getId()
        ));

        logger.info("Sample data initialization completed successfully!");
    }
}

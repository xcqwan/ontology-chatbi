import { OntologySchema, DataSource, ObjectMapping } from './types';
import { Users, ShoppingCart, Box, Building, ClipboardList } from 'lucide-react';

export const INITIAL_ONTOLOGY: OntologySchema = {
  objectTypes: [
    {
      id: 'customer',
      name: 'Customer',
      displayName: 'Customer',
      icon: Users,
      iconKey: 'Users',
      description: 'Individuals or organizations that purchase products, segmented by value and region.',
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
      properties: [
        { id: 'cust_id', name: 'customerId', displayName: 'Customer ID', type: 'id', isPrimaryKey: true },
        { id: 'cust_name', name: 'fullName', displayName: 'Full Name', type: 'string' },
        { id: 'cust_email', name: 'email', displayName: 'Email', type: 'string' },
        { id: 'cust_segment', name: 'segment', displayName: 'Segment', type: 'status' },
        { id: 'cust_region', name: 'region', displayName: 'Region', type: 'string' },
        { id: 'cust_ltv', name: 'lifetimeValue', displayName: 'Lifetime Value', type: 'currency' },
      ]
    },
    {
      id: 'store',
      name: 'Store',
      displayName: 'Store',
      icon: Building,
      iconKey: 'Building',
      description: 'Physical retail locations managing sales and local inventory.',
      color: 'bg-orange-100',
      textColor: 'text-orange-700',
      properties: [
        { id: 'store_id', name: 'storeId', displayName: 'Store ID', type: 'id', isPrimaryKey: true },
        { id: 'store_name', name: 'storeName', displayName: 'Store Name', type: 'string' },
        { id: 'store_city', name: 'city', displayName: 'City', type: 'string' },
        { id: 'store_state', name: 'state', displayName: 'State', type: 'string' },
        { id: 'store_manager', name: 'manager', displayName: 'Manager', type: 'string' },
      ]
    },
    {
      id: 'order',
      name: 'Order',
      displayName: 'Order',
      icon: ShoppingCart,
      iconKey: 'ShoppingCart',
      description: 'Transactional records of purchases linked to customers and stores.',
      color: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      properties: [
        { id: 'ord_id', name: 'orderId', displayName: 'Order ID', type: 'id', isPrimaryKey: true },
        { id: 'ord_date', name: 'purchaseDate', displayName: 'Purchase Date', type: 'date' },
        { id: 'ord_total', name: 'totalAmount', displayName: 'Total Amount', type: 'currency' },
        { id: 'ord_status', name: 'status', displayName: 'Status', type: 'status' },
        { id: 'ord_cust_id', name: 'customerRefId', displayName: 'Customer Ref', type: 'id' }, 
        { id: 'ord_store_id', name: 'storeRefId', displayName: 'Store Ref', type: 'id' },
      ]
    },
    {
      id: 'order_detail',
      name: 'OrderDetail',
      displayName: 'Order Detail',
      icon: ClipboardList,
      iconKey: 'ClipboardList',
      description: 'Individual line items for each order, specifying product and quantity.',
      color: 'bg-slate-100',
      textColor: 'text-slate-700',
      properties: [
        { id: 'detail_id', name: 'lineId', displayName: 'Line ID', type: 'id', isPrimaryKey: true },
        { id: 'detail_qty', name: 'quantity', displayName: 'Quantity', type: 'number' },
        { id: 'detail_subtotal', name: 'subtotal', displayName: 'Subtotal', type: 'currency' },
        { id: 'detail_ord_id', name: 'orderRefId', displayName: 'Order Ref', type: 'id' },
        { id: 'detail_prod_id', name: 'productRefId', displayName: 'Product Ref', type: 'id' },
      ]
    },
    {
      id: 'product',
      name: 'Product',
      displayName: 'Product',
      icon: Box,
      iconKey: 'Box',
      description: 'Items available for sale in the inventory catalog.',
      color: 'bg-purple-100',
      textColor: 'text-purple-700',
      properties: [
        { id: 'prod_id', name: 'productId', displayName: 'Product ID', type: 'id', isPrimaryKey: true },
        { id: 'prod_name', name: 'productName', displayName: 'Product Name', type: 'string' },
        { id: 'prod_cat', name: 'category', displayName: 'Category', type: 'string' },
        { id: 'prod_price', name: 'unitPrice', displayName: 'Unit Price', type: 'currency' },
        { id: 'prod_stock', name: 'stockLevel', displayName: 'Stock Level', type: 'number' },
      ]
    },
  ],
  relations: [
    {
      id: 'rel_cust_order',
      sourceTypeId: 'customer',
      targetTypeId: 'order',
      name: 'places',
      displayName: 'Places',
      cardinality: 'one-to-many'
    },
    {
      id: 'rel_store_order',
      sourceTypeId: 'store',
      targetTypeId: 'order',
      name: 'fulfills',
      displayName: 'Fulfills',
      cardinality: 'one-to-many'
    },
    {
      id: 'rel_order_detail',
      sourceTypeId: 'order',
      targetTypeId: 'order_detail',
      name: 'includes_line_item',
      displayName: 'Includes',
      cardinality: 'one-to-many'
    },
    {
      id: 'rel_detail_product',
      sourceTypeId: 'order_detail',
      targetTypeId: 'product',
      name: 'references_product',
      displayName: 'References Product',
      cardinality: 'one-to-one' // Modeling as link to single product per line
    }
  ]
};

export const MOCK_DATA_SOURCES: DataSource[] = [
  {
    id: 'src_customers',
    name: 'CRM_Customers.csv',
    type: 'csv',
    rowCount: 10,
    description: 'Customer master data with segmentation',
    columns: ['ID', 'Name', 'Email', 'Segment', 'Region', 'LTV'],
    data: [
      { ID: 'C001', Name: 'Acme Corp', Email: 'contact@acme.com', Segment: 'Enterprise', Region: 'North America', LTV: 154000 },
      { ID: 'C002', Name: 'Wayne Ent', Email: 'b.wayne@wayne.com', Segment: 'Strategic', Region: 'North America', LTV: 1200000 },
      { ID: 'C003', Name: 'Stark Ind', Email: 'tony@stark.com', Segment: 'Strategic', Region: 'North America', LTV: 8500000 },
      { ID: 'C004', Name: 'Cyberdyne', Email: 'sales@cyberdyne.com', Segment: 'Enterprise', Region: 'Europe', LTV: 320000 },
      { ID: 'C005', Name: 'Massive Dyn', Email: 'bell@massive.com', Segment: 'SMB', Region: 'Europe', LTV: 15000 },
      { ID: 'C006', Name: 'Globex', Email: 'hank@globex.com', Segment: 'Enterprise', Region: 'Asia', LTV: 42000 },
      { ID: 'C007', Name: 'Soylent', Email: 'info@soylent.com', Segment: 'SMB', Region: 'Asia', LTV: 8000 },
      { ID: 'C008', Name: 'Umbrella', Email: 'wesker@umbrella.com', Segment: 'Strategic', Region: 'Europe', LTV: 950000 },
      { ID: 'C009', Name: 'InGen', Email: 'hammond@ingen.com', Segment: 'Enterprise', Region: 'South America', LTV: 67000 },
      { ID: 'C010', Name: 'Aperture', Email: 'glados@aperture.com', Segment: 'Strategic', Region: 'North America', LTV: 450000 },
    ]
  },
  {
    id: 'src_stores',
    name: 'Retail_Locations.csv',
    type: 'csv',
    rowCount: 5,
    description: 'Physical store metadata',
    columns: ['Store_Code', 'Store_Name', 'City', 'State', 'Manager_Name'],
    data: [
      { Store_Code: 'S-NY-01', Store_Name: 'Manhattan Flagship', City: 'New York', State: 'NY', Manager_Name: 'S. Rogers' },
      { Store_Code: 'S-CA-01', Store_Name: 'San Francisco Hub', City: 'San Francisco', State: 'CA', Manager_Name: 'S. Lang' },
      { Store_Code: 'S-TX-01', Store_Name: 'Austin Depot', City: 'Austin', State: 'TX', Manager_Name: 'T. Odinson' },
      { Store_Code: 'S-LDN-01', Store_Name: 'London Central', City: 'London', State: 'UK', Manager_Name: 'P. Carter' },
      { Store_Code: 'S-TYO-01', Store_Name: 'Tokyo Shibuya', City: 'Tokyo', State: 'JP', Manager_Name: 'N. Romanoff' },
    ]
  },
  {
    id: 'src_orders',
    name: 'Sales_Orders_2023.csv',
    type: 'csv',
    rowCount: 15,
    description: 'Header-level sales transactions',
    columns: ['Order_No', 'Date', 'Cust_ID', 'Store_ID', 'Total_Amt', 'Order_Status'],
    data: [
      { Order_No: 'ORD-001', Date: '2023-01-15', Cust_ID: 'C002', Store_ID: 'S-NY-01', Total_Amt: 15000, Order_Status: 'Completed' },
      { Order_No: 'ORD-002', Date: '2023-01-18', Cust_ID: 'C001', Store_ID: 'S-CA-01', Total_Amt: 3200, Order_Status: 'Shipped' },
      { Order_No: 'ORD-003', Date: '2023-02-05', Cust_ID: 'C003', Store_ID: 'S-NY-01', Total_Amt: 89000, Order_Status: 'Processing' },
      { Order_No: 'ORD-004', Date: '2023-02-12', Cust_ID: 'C002', Store_ID: 'S-NY-01', Total_Amt: 4500, Order_Status: 'Completed' },
      { Order_No: 'ORD-005', Date: '2023-03-01', Cust_ID: 'C003', Store_ID: 'S-TX-01', Total_Amt: 12000, Order_Status: 'Completed' },
      { Order_No: 'ORD-006', Date: '2023-03-15', Cust_ID: 'C001', Store_ID: 'S-CA-01', Total_Amt: 800, Order_Status: 'Returned' },
      { Order_No: 'ORD-007', Date: '2023-04-20', Cust_ID: 'C004', Store_ID: 'S-LDN-01', Total_Amt: 32000, Order_Status: 'Completed' },
      { Order_No: 'ORD-008', Date: '2023-05-10', Cust_ID: 'C005', Store_ID: 'S-LDN-01', Total_Amt: 120, Order_Status: 'Cancelled' },
      { Order_No: 'ORD-009', Date: '2023-05-22', Cust_ID: 'C002', Store_ID: 'S-NY-01', Total_Amt: 56000, Order_Status: 'Completed' },
      { Order_No: 'ORD-010', Date: '2023-06-05', Cust_ID: 'C008', Store_ID: 'S-LDN-01', Total_Amt: 110000, Order_Status: 'Shipped' },
      { Order_No: 'ORD-011', Date: '2023-06-15', Cust_ID: 'C009', Store_ID: 'S-TX-01', Total_Amt: 4500, Order_Status: 'Completed' },
      { Order_No: 'ORD-012', Date: '2023-07-01', Cust_ID: 'C010', Store_ID: 'S-CA-01', Total_Amt: 23000, Order_Status: 'Processing' },
      { Order_No: 'ORD-013', Date: '2023-07-05', Cust_ID: 'C007', Store_ID: 'S-TYO-01', Total_Amt: 1500, Order_Status: 'Completed' },
      { Order_No: 'ORD-014', Date: '2023-07-10', Cust_ID: 'C006', Store_ID: 'S-TYO-01', Total_Amt: 8500, Order_Status: 'Completed' },
      { Order_No: 'ORD-015', Date: '2023-07-12', Cust_ID: 'C003', Store_ID: 'S-NY-01', Total_Amt: 50000, Order_Status: 'Completed' },
    ]
  },
  {
    id: 'src_order_lines',
    name: 'Order_Line_Items.csv',
    type: 'csv',
    rowCount: 25,
    description: 'Detailed product breakdown per order',
    columns: ['Line_ID', 'Order_Ref', 'Product_Ref', 'Qty', 'Line_Total'],
    data: [
      { Line_ID: 'L001', Order_Ref: 'ORD-001', Product_Ref: 'P-106', Qty: 1, Line_Total: 15000 },
      { Line_ID: 'L002', Order_Ref: 'ORD-002', Product_Ref: 'P-102', Qty: 2, Line_Total: 2400 },
      { Line_ID: 'L003', Order_Ref: 'ORD-002', Product_Ref: 'P-105', Qty: 1, Line_Total: 500 }, // +300 misc
      { Line_ID: 'L004', Order_Ref: 'ORD-003', Product_Ref: 'P-103', Qty: 3, Line_Total: 75000 },
      { Line_ID: 'L005', Order_Ref: 'ORD-003', Product_Ref: 'P-101', Qty: 3, Line_Total: 13500 },
      { Line_ID: 'L006', Order_Ref: 'ORD-004', Product_Ref: 'P-101', Qty: 1, Line_Total: 4500 },
      { Line_ID: 'L007', Order_Ref: 'ORD-005', Product_Ref: 'P-102', Qty: 10, Line_Total: 12000 },
      { Line_ID: 'L008', Order_Ref: 'ORD-006', Product_Ref: 'P-108', Qty: 5, Line_Total: 750 },
      { Line_ID: 'L009', Order_Ref: 'ORD-007', Product_Ref: 'P-103', Qty: 1, Line_Total: 25000 },
      { Line_ID: 'L010', Order_Ref: 'ORD-007', Product_Ref: 'P-104', Qty: 1, Line_Total: 8900 }, // approx
      { Line_ID: 'L011', Order_Ref: 'ORD-009', Product_Ref: 'P-103', Qty: 2, Line_Total: 50000 },
      { Line_ID: 'L012', Order_Ref: 'ORD-009', Product_Ref: 'P-102', Qty: 5, Line_Total: 6000 },
      { Line_ID: 'L013', Order_Ref: 'ORD-010', Product_Ref: 'P-106', Qty: 5, Line_Total: 75000 },
      { Line_ID: 'L014', Order_Ref: 'ORD-010', Product_Ref: 'P-103', Qty: 1, Line_Total: 25000 },
      { Line_ID: 'L015', Order_Ref: 'ORD-011', Product_Ref: 'P-101', Qty: 1, Line_Total: 4500 },
      { Line_ID: 'L016', Order_Ref: 'ORD-012', Product_Ref: 'P-106', Qty: 1, Line_Total: 15000 },
      { Line_ID: 'L017', Order_Ref: 'ORD-012', Product_Ref: 'P-104', Qty: 1, Line_Total: 8000 },
      { Line_ID: 'L018', Order_Ref: 'ORD-013', Product_Ref: 'P-105', Qty: 3, Line_Total: 1500 },
      { Line_ID: 'L019', Order_Ref: 'ORD-014', Product_Ref: 'P-104', Qty: 1, Line_Total: 8900 },
      { Line_ID: 'L020', Order_Ref: 'ORD-015', Product_Ref: 'P-103', Qty: 2, Line_Total: 50000 },
    ]
  },
  {
    id: 'src_products',
    name: 'Product_Catalog.csv',
    type: 'csv',
    rowCount: 9,
    description: 'Master inventory list',
    columns: ['SKU', 'Title', 'Category', 'MSRP', 'Stock'],
    data: [
      { SKU: 'P-101', Title: 'Quantum Processor', Category: 'Hardware', MSRP: 4500, Stock: 50 },
      { SKU: 'P-102', Title: 'Flux Capacitor', Category: 'Components', MSRP: 1200, Stock: 12 },
      { SKU: 'P-103', Title: 'Neural Net License', Category: 'Software', MSRP: 25000, Stock: 999 },
      { SKU: 'P-104', Title: 'Positronic Brain', Category: 'Hardware', MSRP: 8900, Stock: 5 },
      { SKU: 'P-105', Title: 'Nano-fiber Chassis', Category: 'Hardware', MSRP: 500, Stock: 200 },
      { SKU: 'P-106', Title: 'Dark Matter Cell', Category: 'Components', MSRP: 15000, Stock: 0 },
      { SKU: 'P-107', Title: 'Portal Gun', Category: 'Hardware', MSRP: 9999, Stock: 2 },
      { SKU: 'P-108', Title: 'Comp. Cube', Category: 'Accessories', MSRP: 150, Stock: 500 },
      { SKU: 'P-109', Title: 'Plumbus', Category: 'Home Goods', MSRP: 60, Stock: 10000 },
    ]
  }
];

export const INITIAL_MAPPINGS: ObjectMapping[] = [
  {
    objectTypeId: 'customer',
    dataSourceId: 'src_customers',
    isComplete: true,
    propertyMappings: {
      'cust_id': 'ID',
      'cust_name': 'Name',
      'cust_email': 'Email',
      'cust_segment': 'Segment',
      'cust_region': 'Region',
      'cust_ltv': 'LTV'
    },
    relationMappings: {}
  },
  {
    objectTypeId: 'store',
    dataSourceId: 'src_stores',
    isComplete: true,
    propertyMappings: {
      'store_id': 'Store_Code',
      'store_name': 'Store_Name',
      'store_city': 'City',
      'store_state': 'State',
      'store_manager': 'Manager_Name'
    },
    relationMappings: {}
  },
  {
    objectTypeId: 'order',
    dataSourceId: 'src_orders',
    isComplete: true,
    propertyMappings: {
      'ord_id': 'Order_No',
      'ord_date': 'Date',
      'ord_total': 'Total_Amt',
      'ord_status': 'Order_Status',
      'ord_cust_id': 'Cust_ID',
      'ord_store_id': 'Store_ID'
    },
    relationMappings: {
      'rel_cust_order': 'Cust_ID',
      'rel_store_order': 'Store_ID'
    }
  },
  {
    objectTypeId: 'order_detail',
    dataSourceId: 'src_order_lines',
    isComplete: true,
    propertyMappings: {
      'detail_id': 'Line_ID',
      'detail_qty': 'Qty',
      'detail_subtotal': 'Line_Total',
      'detail_ord_id': 'Order_Ref',
      'detail_prod_id': 'Product_Ref'
    },
    relationMappings: {
      'rel_order_detail': 'Order_Ref',
      'rel_detail_product': 'Product_Ref'
    }
  },
  {
    objectTypeId: 'product',
    dataSourceId: 'src_products',
    isComplete: true,
    propertyMappings: {
      'prod_id': 'SKU',
      'prod_name': 'Title',
      'prod_cat': 'Category',
      'prod_price': 'MSRP',
      'prod_stock': 'Stock'
    },
    relationMappings: {}
  }
];
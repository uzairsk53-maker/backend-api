# Database Schema Design - Shop Credit App

## Users Collection
- **_id**: ObjectId
- **phone**: String (Unique)
- **email**: String (Unique)
- **password**: String (Hashed)
- **role**: Enum ['ADMIN', 'SHOPKEEPER', 'DELIVERY']
- **refreshToken**: String
- **createdAt**: Date
- **updatedAt**: Date

## Shopkeepers Collection (Profile)
- **_id**: ObjectId
- **user**: ObjectId (Ref -> Users)
- **shopName**: String
- **ownerName**: String
- **phone**: String
- **email**: String
- **address**: String
- **city**: String
- **creditScore**: Number (Default: 10000)
- **creditPoints**: Number (Default: 0)
- **repaymentHistory**: Array of Objects:
  - **amount**: Number
  - **date**: Date
  - **status**: Enum ['ON_TIME', 'LATE', 'PENDING']
  - **pointsRewarded**: Number
  - **penalty**: Number
- **createdAt**: Date
- **updatedAt**: Date

## Products Collection
- **_id**: ObjectId
- **name**: String (Indexed: text)
- **category**: String (Indexed: text)
- **price**: Number
- **bulkPrice**: Number
- **stock**: Number
- **images**: Array of Strings (URLs)
- **description**: String
- **createdAt**: Date
- **updatedAt**: Date

## Orders Collection
- **_id**: ObjectId
- **shopkeeperId**: ObjectId (Ref -> Shopkeepers)
- **products**: Array of Objects:
  - **productId**: ObjectId (Ref -> Products)
  - **quantity**: Number
  - **priceAtOrder**: Number
- **orderType**: Enum ['NORMAL', 'BULK', 'FAST_DELIVERY']
- **totalAmount**: Number
- **creditUsed**: Number
- **cashAmount**: Number
- **paymentType**: Enum ['CASH', 'CREDIT', 'HYBRID']
- **status**: Enum ['PENDING', 'APPROVED', 'PACKED', 'SHIPPED', 'DELIVERED']
- **deliveryBoyId**: ObjectId (Ref -> Users)
- **expectedDelivery**: Date
- **repaymentDeadline**: Date
- **createdAt**: Date
- **updatedAt**: Date

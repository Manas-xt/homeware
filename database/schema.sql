-- Lustre Homeware catalog schema (Azure SQL Database)

CREATE TABLE Categories (
    CategoryId      INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(100)  NOT NULL,
    Slug            NVARCHAR(100)  NOT NULL UNIQUE,
    Description     NVARCHAR(500)  NULL
);

CREATE TABLE Products (
    ProductId       INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId      INT NOT NULL FOREIGN KEY REFERENCES Categories(CategoryId),
    Sku             NVARCHAR(50)   NOT NULL UNIQUE,
    Name            NVARCHAR(200)  NOT NULL,
    Slug            NVARCHAR(200)  NOT NULL UNIQUE,
    Description     NVARCHAR(MAX)  NULL,
    Price           DECIMAL(10,2)  NOT NULL,
    Currency        CHAR(3)        NOT NULL DEFAULT 'USD',
    Material        NVARCHAR(150)  NULL,
    ImageUrl        NVARCHAR(500)  NULL,
    StockQuantity   INT            NOT NULL DEFAULT 0,
    IsActive        BIT            NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Products_IsActive ON Products(IsActive);

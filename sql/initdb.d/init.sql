CREATE TABLE reservations
(
    id int NOT NULL AUTO_INCREMENT, 
    reservation_uuid varchar(255) NULL, 
    status enum('PENDING', 'APPROVED', 'CANCELED') NOT NULL DEFAULT 'PENDING', 
    reservation_date varchar(255) NOT NULL, 
    year int NOT NULL, 
    month int NOT NULL, 
    date int NOT NULL, 
    created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
    updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
    username varchar(255) NOT NULL, 
    phoneNumber varchar(255) NOT NULL, 
    tourId int NOT NULL, 
    UNIQUE INDEX IDX_c6abad35b76f4c7b3df05fda11(reservation_uuid), 
    UNIQUE INDEX IDX_d075bee6d69575c661e88b3bfd(phoneNumber), 
    PRIMARY KEY(id)
);

CREATE TABLE dayoffs
(
    id int NOT NULL AUTO_INCREMENT, 
    type enum('WEEKLY', 'MONTHLY', 'DATE') NOT NULL, 
    month int NULL, 
    dayOfMonth int NULL, 
    dayOfWeek int NULL, 
    date int NULL, 
    tourId int NULL, 
    PRIMARY KEY(id)
);

CREATE TABLE tours
(
    id int NOT NULL AUTO_INCREMENT, 
    title varchar(255) NOT NULL, 
    created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
    updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
    sellerId int NOT NULL, 
    PRIMARY KEY(id)
);

CREATE TABLE sellers
(
    id int NOT NULL AUTO_INCREMENT, 
    name varchar(100) NOT NULL, 
    created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
    updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
    UNIQUE INDEX IDX_e9c41f4c30a7374ff3e7c71a8b (name), 
    PRIMARY KEY(`id`)
);

ALTER TABLE reservations ADD CONSTRAINT FK_a6ae32b001256db95c8607b7cbc FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE dayoffs ADD CONSTRAINT FK_840c11940b042c8eae70159b648 FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE tours ADD CONSTRAINT FK_08a7961cf1050e1f308ccba7976 FOREIGN KEY (sellerId) REFERENCES sellers(id) ON DELETE CASCADE ON UPDATE NO ACTION
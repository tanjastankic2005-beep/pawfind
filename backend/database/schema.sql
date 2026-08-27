CREATE DATABASE IF NOT EXISTS pawfind;
USE pawfind;

CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'user',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pets (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  species        VARCHAR(20)  NOT NULL,
  breed          VARCHAR(100),
  age            INT          NOT NULL,
  gender         VARCHAR(10)  NOT NULL,
  size           VARCHAR(20)  NOT NULL,
  location       VARCHAR(100) NOT NULL,
  description    TEXT,
  image          VARCHAR(255),
  personality    VARCHAR(50),
  vaccinated     BOOLEAN      DEFAULT FALSE,
  neutered       BOOLEAN      DEFAULT FALSE,
  good_with_kids BOOLEAN      DEFAULT FALSE,
  good_with_dogs BOOLEAN      DEFAULT FALSE,
  good_with_cats BOOLEAN      DEFAULT FALSE,
  status         VARCHAR(20)  NOT NULL DEFAULT 'available',
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  pet_id            INT NOT NULL,
  phone             VARCHAR(30),
  city              VARCHAR(100),
  housing_type      VARCHAR(50),
  has_yard          BOOLEAN     DEFAULT FALSE,
  has_other_pets    BOOLEAN     DEFAULT FALSE,
  has_children      BOOLEAN     DEFAULT FALSE,
  pet_experience    TEXT,
  reason            TEXT        NOT NULL,
  preferred_contact VARCHAR(20),
  status            VARCHAR(30) NOT NULL DEFAULT 'Pending',
  created_at        TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id)  REFERENCES pets(id)  ON DELETE CASCADE
);

CREATE TABLE favorites (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  pet_id     INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id)  REFERENCES pets(id)  ON DELETE CASCADE,

  UNIQUE (user_id, pet_id)
);
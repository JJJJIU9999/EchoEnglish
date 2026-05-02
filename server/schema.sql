-- ============================================================
-- EchoEnglish Schema v1
-- Engine: InnoDB, Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS echo_english
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE echo_english;

-- -----------------------------------------------------------
-- 1. Users
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  nickname      VARCHAR(100)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. Corpus (learning materials / videos)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS corpus (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(200)  NOT NULL,
  description      TEXT,
  scenario         VARCHAR(50)   NOT NULL COMMENT 'daily, business, travel, academic, entertainment',
  difficulty       TINYINT       NOT NULL COMMENT '1-5',
  video_url        VARCHAR(500)  NOT NULL,
  thumbnail_url    VARCHAR(500),
  duration_seconds INT           NOT NULL DEFAULT 0,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_corpus_scenario (scenario),
  INDEX idx_corpus_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 3. Sentences (subtitle segments)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS sentences (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  corpus_id      INT            NOT NULL,
  sentence_index INT            NOT NULL COMMENT 'Order within the video (1-based)',
  start_time     DECIMAL(10,3)  NOT NULL,
  end_time       DECIMAL(10,3)  NOT NULL,
  english_text   TEXT           NOT NULL,
  chinese_text   TEXT,
  FOREIGN KEY (corpus_id) REFERENCES corpus(id) ON DELETE CASCADE,
  INDEX idx_sentences_corpus (corpus_id, sentence_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 4. Learning Records
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_records (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT            NOT NULL,
  corpus_id        INT            NOT NULL,
  total_sentences  INT            NOT NULL,
  correct_sentences INT           NOT NULL DEFAULT 0,
  accuracy         DECIMAL(5,2)   NOT NULL,
  duration_seconds INT            NOT NULL DEFAULT 0,
  created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (corpus_id) REFERENCES corpus(id) ON DELETE CASCADE,
  INDEX idx_records_user (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 5. Vocabulary
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS vocabulary (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT            NOT NULL,
  word          VARCHAR(100)   NOT NULL,
  definition    TEXT,
  sentence_id   INT            DEFAULT NULL,
  mastery_level TINYINT        NOT NULL DEFAULT 0 COMMENT '0=new, 1=learning, 2=familiar, 3=mastered',
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE SET NULL,
  INDEX idx_vocab_user (user_id, mastery_level),
  UNIQUE KEY uk_user_word (user_id, word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

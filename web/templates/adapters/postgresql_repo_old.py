import psycopg2
import psycopg2.extras
from urllib.parse import urlparse
import os

class PostgreSQLRepo:
    """PostgreSQL 데이터베이스 레포지토리"""
    
    def __init__(self):
        self.conn_params = self._parse_database_url()
    
    def _parse_database_url(self):
        """DATABASE_URL 환경변수를 파싱하여 연결 정보 추출"""
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            # 로컬 개발용 기본값
            return {
                'host': os.getenv("POSTGRES_HOST", "localhost"),
                'port': os.getenv("POSTGRES_PORT", "5432"),
                'database': os.getenv("POSTGRES_DB", "secretboard"),
                'user': os.getenv("POSTGRES_USER", "postgres"),
                'password': os.getenv("POSTGRES_PASSWORD", "password")
            }
        
        # Render.com에서 제공하는 DATABASE_URL 파싱
        result = urlparse(database_url)
        return {
            'host': result.hostname,
            'port': result.port,
            'database': result.path[1:],  # 맨 앞의 '/' 제거
            'user': result.username,
            'password': result.password
        }
    
    def _get_connection(self):
        """데이터베이스 연결 생성"""
        return psycopg2.connect(**self.conn_params)
    
    def _ensure_tables_exist(self):
        """테이블이 존재하지 않으면 생성"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                # tickets 테이블 생성
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS tickets (
                        id SERIAL PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        content TEXT,
                        password_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        view_count INTEGER DEFAULT 0,
                        is_deleted BOOLEAN DEFAULT FALSE
                    )
                """)
                
                # admin_users 테이블 생성
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS admin_users (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(100) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # messages 테이블 생성 (외래키 제약조건 없이)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS messages (
                        id SERIAL PRIMARY KEY,
                        ticket_id INTEGER NOT NULL,
                        content TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        is_deleted BOOLEAN DEFAULT FALSE
                    )
                """)
                
                # 외래키 제약조건 추가 (이미 존재하는 경우 무시)
                try:
                    cursor.execute("""
                        ALTER TABLE messages 
                        ADD CONSTRAINT fk_messages_tickets 
                        FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
                    """)
                except psycopg2.errors.DuplicateObject:
                    # 이미 존재하는 제약조건
                    pass
                
                # 인덱스 생성 (존재하지 않으면)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_tickets_created_at 
                    ON tickets(created_at DESC)
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_tickets_is_deleted 
                    ON tickets(is_deleted)
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_messages_ticket_id 
                    ON messages(ticket_id)
                """)
                
                conn.commit()
    
    def create_ticket(self, title, content, password_hash):
        """새 티켓 생성"""
        self._ensure_tables_exist()
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO tickets (title, content, password_hash)
                    VALUES (%s, %s, %s)
                    RETURNING id
                """, (title, content, password_hash))
                
                ticket_id = cursor.fetchone()[0]
                conn.commit()
                return ticket_id
    
    def get_tickets(self, limit=50, offset=0):
        """티켓 목록 조회"""
        self._ensure_tables_exist()
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT id, title, created_at, view_count
                    FROM tickets
                    WHERE is_deleted = FALSE
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """, (limit, offset))
                
                return [dict(row) for row in cursor.fetchall()]
    
    def get_ticket_by_id(self, ticket_id):
        """ID로 티켓 조회"""
        self._ensure_tables_exist()
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT id, title, content, password_hash, created_at, view_count
                    FROM tickets
                    WHERE id = %s AND is_deleted = FALSE
                """, (ticket_id,))
                
                row = cursor.fetchone()
                return dict(row) if row else None
    
    def verify_ticket_password(self, ticket_id, password_hash):
        """티켓 비밀번호 확인"""
        ticket = self.get_ticket_by_id(ticket_id)
        return ticket and ticket['password_hash'] == password_hash
    
    def increment_view_count(self, ticket_id):
        """조회수 증가"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE tickets 
                    SET view_count = view_count + 1
                    WHERE id = %s
                """, (ticket_id,))
                conn.commit()
    
    def update_ticket(self, ticket_id, title, content):
        """티켓 수정"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE tickets 
                    SET title = %s, content = %s
                    WHERE id = %s AND is_deleted = FALSE
                """, (title, content, ticket_id))
                conn.commit()
    
    def delete_ticket(self, ticket_id):
        """티켓 삭제 (soft delete)"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE tickets 
                    SET is_deleted = TRUE
                    WHERE id = %s
                """, (ticket_id,))
                conn.commit()
    
    def create_message(self, ticket_id, content):
        """새 메시지 생성"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO messages (ticket_id, content)
                    VALUES (%s, %s)
                    RETURNING id
                """, (ticket_id, content))
                
                message_id = cursor.fetchone()[0]
                conn.commit()
                return message_id
    
    def get_messages_by_ticket(self, ticket_id):
        """티켓의 메시지 목록 조회"""
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT id, content, created_at
                    FROM messages
                    WHERE ticket_id = %s AND is_deleted = FALSE
                    ORDER BY created_at ASC
                """, (ticket_id,))
                
                return [dict(row) for row in cursor.fetchall()]
    
    def create_admin_user(self, username, password_hash):
        """관리자 사용자 생성"""
        self._ensure_tables_exist()
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                try:
                    cursor.execute("""
                        INSERT INTO admin_users (username, password_hash)
                        VALUES (%s, %s)
                        RETURNING id
                    """, (username, password_hash))
                    
                    admin_id = cursor.fetchone()[0]
                    conn.commit()
                    return admin_id
                except psycopg2.IntegrityError:
                    # 이미 존재하는 사용자명
                    conn.rollback()
                    return None
    
    def verify_admin_user(self, username, password_hash):
        """관리자 사용자 인증"""
        self._ensure_tables_exist()
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id FROM admin_users
                    WHERE username = %s AND password_hash = %s
                """, (username, password_hash))
                
                return cursor.fetchone() is not None
    
    def get_all_tickets_for_admin(self, limit=100, offset=0):
        """관리자용 전체 티켓 조회 (삭제된 것 포함)"""
        self._ensure_tables_exist()
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT id, title, created_at, view_count, is_deleted
                    FROM tickets
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """, (limit, offset))
                
                return [dict(row) for row in cursor.fetchall()]
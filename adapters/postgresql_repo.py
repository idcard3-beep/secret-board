import psycopg2
import psycopg2.extras
from urllib.parse import urlparse
import os
import uuid
from datetime import datetime

class PostgreSQLRepo:
    """PostgreSQL 데이터베이스 레포지토리 (새 스키마 + 하위 호환성)"""
    
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
                'password': os.getenv("POSTGRES_PASSWORD", "rich")
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
        """테이블이 존재하지 않으면 생성 (간소화된 체크)"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                # tickets 테이블 존재 확인
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'tickets'
                    )
                """)
                
                if not cursor.fetchone()[0]:
                    print("⚠️  테이블이 존재하지 않습니다. reset_pg_tables.py를 먼저 실행하세요.")
                    return False
                
                return True

    # ===========================================
    # 기존 인터페이스 호환 메서드들 (웹 애플리케이션용)
    # ===========================================
    
    def list_tickets(self):
        """기존 인터페이스 호환: 티켓 목록 조회"""
        return self.get_tickets()
    
    def create_ticket(self, ticket_data):
        """기존 인터페이스 호환: 딕셔너리 형태의 티켓 데이터를 받아서 처리"""
        if not isinstance(ticket_data, dict):
            raise ValueError("create_ticket에는 딕셔너리 형태의 ticket_data가 필요합니다")
        
        # 딕셔너리에서 필요한 필드 추출
        title = ticket_data.get('title', '')
        content = ticket_data.get('content', '')
        password_hash = ticket_data.get('post_pwd_hash') or ticket_data.get('password_hash', '')
        
        # 추가 필드들
        kwargs = {
            'author_name': ticket_data.get('author_name'),
            'author_nickname': ticket_data.get('author_nickname'),
            'author_contact': ticket_data.get('author_contact'),
            'author_phone': ticket_data.get('author_phone'),
            'author_email': ticket_data.get('author_email'),
            'author_gender': ticket_data.get('author_gender'),
            'birth_year': ticket_data.get('birth_year'),
            'snsgu': ticket_data.get('snsgu'),
            'choice1': ticket_data.get('choice1', 0),
            'choice2': ticket_data.get('choice2', 0),
            'choice3': ticket_data.get('choice3', 0),
            'choice4': ticket_data.get('choice4', 0),
            'choice5': ticket_data.get('choice5', 0),
            'choice6': ticket_data.get('choice6', 0),
            'choice7': ticket_data.get('choice7', 0),
            'choice8': ticket_data.get('choice8', 0),
            'choice9': ticket_data.get('choice9', 0),
            'choice10': ticket_data.get('choice10', 0),
            'choice11': ticket_data.get('choice11', 0),
            'choice12': ticket_data.get('choice12', 0),
            'agreement': ticket_data.get('agreement', 0)
        }
        
        return self._create_ticket_internal(title, content, password_hash, **kwargs)
    
    def get_ticket(self, ticket_id):
        """기존 인터페이스 호환: get_ticket_by_id()의 래퍼"""
        return self.get_ticket_by_id(ticket_id)
    
    def update_ticket(self, ticket_id, data):
        """기존 인터페이스 호환: 딕셔너리 형태의 data를 받아서 처리"""
        if isinstance(data, dict):
            title = data.get('title', '')
            content = data.get('content', '')
            author_name = data.get('author_name', '')
            author_contact = data.get('author_contact', '')
            return self._update_ticket_internal(ticket_id, title, content, author_name, author_contact)
        else:
            raise ValueError("update_ticket에는 딕셔너리 형태의 data가 필요합니다")
    
    def list_messages(self, ticket_id):
        """기존 인터페이스 호환: get_messages_by_ticket()의 래퍼"""
        return self.get_messages_by_ticket(ticket_id)
    
    def create_message(self, message_data):
        """기존 인터페이스 호환: 딕셔너리 형태의 메시지 데이터를 받아서 처리"""
        if isinstance(message_data, dict):
            ticket_id = message_data.get('ticket_id')
            content = message_data.get('content', '')
            role = message_data.get('role', 'USER')
            return self._create_message_internal(ticket_id, content, role)
        else:
            raise ValueError("create_message에는 딕셔너리 형태의 message_data가 필요합니다")
    
    def mark_has_admin_reply(self, ticket_id):
        """기존 인터페이스 호환: 관리자 답변 표시 및 상태 업데이트"""
        print(f"🔄 mark_has_admin_reply 호출 - ticket_id: {ticket_id} (타입: {type(ticket_id)})")
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                # UUID 형식으로 업데이트 시도
                print(f"🔄 UUID 형식으로 업데이트 시도: {ticket_id}")
                cursor.execute("""
                    UPDATE tickets 
                    SET has_admin_reply = TRUE, 
                        status = 'ANSWERED',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE ticket_id = %s::uuid
                """, (str(ticket_id),))
                
                rows_affected_uuid = cursor.rowcount
                print(f"� UUID 매칭으로 업데이트된 행 수: {rows_affected_uuid}")
                
                # UUID로 업데이트되지 않았다면 문자열 매칭 시도
                if rows_affected_uuid == 0:
                    print(f"� 문자열 매칭으로 재시도")
                    cursor.execute("""
                        UPDATE tickets 
                        SET has_admin_reply = TRUE, 
                            status = 'ANSWERED',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE ticket_id::text = %s
                    """, (str(ticket_id),))
                    
                    rows_affected_string = cursor.rowcount
                    print(f"📊 문자열 매칭으로 업데이트된 행 수: {rows_affected_string}")
                    
                    if rows_affected_string == 0:
                        print(f"❌ 어떤 방법으로도 업데이트되지 않음!")
                        # 티켓 존재 여부 확인
                        cursor.execute("SELECT ticket_id::text, status FROM tickets WHERE ticket_id::text LIKE %s", (f"%{str(ticket_id)[-8:]}%",))
                        similar = cursor.fetchall()
                        print(f"🔍 유사한 티켓들: {similar}")
                
                conn.commit()
                
                # 최종 상태 확인
                cursor.execute("""
                    SELECT status, has_admin_reply 
                    FROM tickets 
                    WHERE ticket_id = %s::uuid OR ticket_id::text = %s
                """, (str(ticket_id), str(ticket_id)))
                
                final_result = cursor.fetchone()
                if final_result:
                    print(f"✅ 최종 상태: status={final_result[0]}, has_admin_reply={final_result[1]}")
                    if final_result[0] != 'ANSWERED':
                        print(f"❌ 심각한 오류: 상태가 여전히 ANSWERED가 아님!")
                else:
                    print(f"❌ 최종 확인에서도 티켓을 찾을 수 없음!")
                
                print(f"✅ mark_has_admin_reply 완료")

    # ===========================================
    # 내부 구현 메서드들 (새 스키마 적용)
    # ===========================================
    
    def _create_ticket_internal(self, title, content, password_hash, **kwargs):
        """내부용 티켓 생성 메서드"""
        if not self._ensure_tables_exist():
            raise Exception("테이블이 존재하지 않습니다")
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                # 기본 필드들
                ticket_data = {
                    'title_masked': title,
                    'content_enc': content,
                    'post_pwd_hash': password_hash,
                    'author_name': kwargs.get('author_name'),
                    'author_nickname': kwargs.get('author_nickname'),
                    'author_contact': kwargs.get('author_contact'),
                    'author_phone': kwargs.get('author_phone'),
                    'author_email': kwargs.get('author_email'),
                    'author_gender': kwargs.get('author_gender'),
                    'birth_year': kwargs.get('birth_year'),
                    'snsgu': kwargs.get('snsgu'),
                    'choice1': kwargs.get('choice1', 0),
                    'choice2': kwargs.get('choice2', 0),
                    'choice3': kwargs.get('choice3', 0),
                    'choice4': kwargs.get('choice4', 0),
                    'choice5': kwargs.get('choice5', 0),
                    'choice6': kwargs.get('choice6', 0),
                    'choice7': kwargs.get('choice7', 0),
                    'choice8': kwargs.get('choice8', 0),
                    'choice9': kwargs.get('choice9', 0),
                    'choice10': kwargs.get('choice10', 0),
                    'choice11': kwargs.get('choice11', 0),
                    'choice12': kwargs.get('choice12', 0),
                    'agreement': kwargs.get('agreement', 0)
                }
                
                cursor.execute("""
                    INSERT INTO tickets (
                        title_masked, content_enc, post_pwd_hash,
                        author_name, author_nickname, author_contact,
                        author_phone, author_email, author_gender,
                        birth_year, snsgu,
                        choice1, choice2, choice3, choice4,
                        choice5, choice6, choice7, choice8,
                        choice9, choice10, choice11, choice12,
                        agreement
                    ) VALUES (
                        %(title_masked)s, %(content_enc)s, %(post_pwd_hash)s,
                        %(author_name)s, %(author_nickname)s, %(author_contact)s,
                        %(author_phone)s, %(author_email)s, %(author_gender)s,
                        %(birth_year)s, %(snsgu)s,
                        %(choice1)s, %(choice2)s, %(choice3)s, %(choice4)s,
                        %(choice5)s, %(choice6)s, %(choice7)s, %(choice8)s,
                        %(choice9)s, %(choice10)s, %(choice11)s, %(choice12)s,
                        %(agreement)s
                    ) RETURNING ticket_id
                """, ticket_data)
                
                ticket_id = cursor.fetchone()[0]
                conn.commit()
                return str(ticket_id)  # UUID를 문자열로 반환
    
    def get_tickets(self, limit=50, offset=0):
        """티켓 목록 조회"""
        if not self._ensure_tables_exist():
            return []
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT 
                        ticket_id::text as id,
                        title_masked as title,
                        author_name,
                        author_contact,
                        created_at,
                        status,
                        has_admin_reply,
                        snsgu
                    FROM tickets
                    WHERE status != 'DELETED'
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """, (limit, offset))
                
                tickets = []
                for row in cursor.fetchall():
                    ticket = dict(row)
                    # 하위 호환성을 위해 view_count 추가
                    ticket['view_count'] = 0
                    tickets.append(ticket)
                
                return tickets
    
    def get_ticket_by_id(self, ticket_id):
        """ID로 티켓 조회"""
        if not self._ensure_tables_exist():
            return None
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                # UUID 또는 문자열 처리
                if isinstance(ticket_id, str):
                    try:
                        uuid.UUID(ticket_id)  # UUID 형식 검증
                    except ValueError:
                        return None
                
                cursor.execute("""
                    SELECT 
                        ticket_id::text as id,
                        title_masked as title,
                        content_enc as content,
                        post_pwd_hash as password_hash,
                        created_at,
                        status,
                        has_admin_reply,
                        author_name,
                        author_nickname,
                        author_contact,
                        author_phone,
                        author_email,
                        snsgu
                    FROM tickets
                    WHERE ticket_id = %s AND status != 'DELETED'
                """, (ticket_id,))
                
                row = cursor.fetchone()
                if row:
                    ticket = dict(row)
                    # 하위 호환성을 위해 view_count 추가
                    ticket['view_count'] = 0
                    return ticket
                return None
    
    def verify_ticket_password(self, ticket_id, password_hash):
        """티켓 비밀번호 확인"""
        ticket = self.get_ticket_by_id(ticket_id)
        return ticket and ticket['password_hash'] == password_hash
    
    def increment_view_count(self, ticket_id):
        """조회수 증가 (새 스키마에서는 updated_at 갱신)"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE tickets 
                    SET updated_at = CURRENT_TIMESTAMP
                    WHERE ticket_id = %s
                """, (ticket_id,))
                conn.commit()
    
    def _update_ticket_internal(self, ticket_id, title, content, author_name='', author_contact=''):
        """내부용 티켓 수정 메서드"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE tickets 
                    SET title_masked = %s, content_enc = %s, author_name = %s, author_contact = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE ticket_id = %s AND status != 'DELETED'
                """, (title, content, author_name, author_contact, ticket_id))
                conn.commit()
    
    def delete_ticket(self, ticket_id):
        """티켓 삭제 (soft delete)"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE tickets 
                    SET status = 'DELETED', updated_at = CURRENT_TIMESTAMP
                    WHERE ticket_id = %s
                """, (ticket_id,))
                conn.commit()
    
    def _create_message_internal(self, ticket_id, content, role='USER'):
        """내부용 메시지 생성 메서드"""
        print(f"🔄 _create_message_internal 호출: ticket_id={ticket_id}, role={role}")
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                # 1. 메시지 생성
                cursor.execute("""
                    INSERT INTO thread_messages (ticket_id, content_enc, role)
                    VALUES (%s::uuid, %s, %s)
                    RETURNING msg_id
                """, (str(ticket_id), content, role))
                
                message_id = cursor.fetchone()[0]
                print(f"📨 메시지 생성 완료: message_id={message_id}")
                
                # 2. 관리자 답변인 경우 티켓 상태 강제 업데이트
                if role == 'ADMIN':
                    print(f"🛡️ 관리자 답변 감지 - 상태를 ANSWERED로 업데이트 시작")
                    
                    # 현재 상태 확인
                    cursor.execute("""
                        SELECT status, has_admin_reply FROM tickets WHERE ticket_id = %s::uuid
                    """, (str(ticket_id),))
                    
                    current = cursor.fetchone()
                    if current:
                        print(f"📋 현재 상태: status={current[0]}, has_admin_reply={current[1]}")
                    else:
                        print(f"❌ 티켓을 찾을 수 없음: {ticket_id}")
                        # 모든 티켓 확인
                        cursor.execute("SELECT ticket_id::text FROM tickets LIMIT 3")
                        existing = cursor.fetchall()
                        print(f"🔍 기존 티켓들: {existing}")
                    
                    # 강제로 ANSWERED 상태로 업데이트
                    cursor.execute("""
                        UPDATE tickets 
                        SET has_admin_reply = TRUE,
                            status = 'ANSWERED',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE ticket_id = %s::uuid
                    """, (str(ticket_id),))
                    
                    rows_affected = cursor.rowcount
                    print(f"📊 업데이트된 행 수: {rows_affected}")
                    
                    if rows_affected == 0:
                        print(f"⚠️ 경고: 업데이트된 행이 없음! ticket_id={ticket_id}")
                        # 다른 형식으로 시도
                        cursor.execute("""
                            UPDATE tickets 
                            SET has_admin_reply = TRUE,
                                status = 'ANSWERED',
                                updated_at = CURRENT_TIMESTAMP
                            WHERE ticket_id::text = %s
                        """, (str(ticket_id),))
                        rows_affected2 = cursor.rowcount
                        print(f"📊 문자열 매칭으로 업데이트된 행 수: {rows_affected2}")
                    
                    # 업데이트 후 확인
                    cursor.execute("""
                        SELECT status, has_admin_reply FROM tickets WHERE ticket_id = %s::uuid
                    """, (str(ticket_id),))
                    
                    after = cursor.fetchone()
                    if after:
                        print(f"✅ 업데이트 후: status={after[0]}, has_admin_reply={after[1]}")
                    else:
                        print(f"❌ 업데이트 후에도 티켓을 찾을 수 없음")
                else:
                    # 일반 사용자 메시지인 경우 updated_at만 업데이트
                    cursor.execute("""
                        UPDATE tickets 
                        SET updated_at = CURRENT_TIMESTAMP
                        WHERE ticket_id = %s::uuid
                    """, (str(ticket_id),))
                
                conn.commit()
                print(f"✅ 트랜잭션 커밋 완료")
                return str(message_id)
    
    def get_messages_by_ticket(self, ticket_id):
        """티켓의 메시지 목록 조회"""
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT 
                        msg_id::text as id,
                        content_enc as content,
                        role,
                        created_at
                    FROM thread_messages
                    WHERE ticket_id = %s
                    ORDER BY created_at ASC
                """, (ticket_id,))
                
                return [dict(row) for row in cursor.fetchall()]
    
    # ===========================================
    # 관리자 관련 메서드
    # ===========================================
    
    def create_admin_user(self, username, password_hash, admin_id=None):
        """관리자 사용자 생성"""
        if not self._ensure_tables_exist():
            raise Exception("테이블이 존재하지 않습니다")
        
        if not admin_id:
            admin_id = f"admin_{username}"
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                try:
                    cursor.execute("""
                        INSERT INTO admin_users (admin_id, username, pwd_hash)
                        VALUES (%s, %s, %s)
                        RETURNING admin_id
                    """, (admin_id, username, password_hash))
                    
                    result_id = cursor.fetchone()[0]
                    conn.commit()
                    return result_id
                except psycopg2.IntegrityError:
                    # 이미 존재하는 사용자명
                    conn.rollback()
                    return None
    
    def get_admin_user(self, username):
        """관리자 사용자 조회"""
        if not self._ensure_tables_exist():
            return None
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT admin_id, username, pwd_hash, role, created_at
                    FROM admin_users
                    WHERE username = %s
                """, (username,))
                
                row = cursor.fetchone()
                return dict(row) if row else None
    
    def verify_admin_user(self, username, password_hash):
        """관리자 사용자 인증"""
        if not self._ensure_tables_exist():
            return False
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT admin_id FROM admin_users
                    WHERE username = %s AND pwd_hash = %s
                """, (username, password_hash))
                
                return cursor.fetchone() is not None
    
    def get_all_tickets_for_admin(self, limit=100, offset=0):
        """관리자용 전체 티켓 조회 (삭제된 것 포함)"""
        if not self._ensure_tables_exist():
            return []
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT 
                        ticket_id::text as id,
                        title_masked as title,
                        created_at,
                        status,
                        has_admin_reply,
                        snsgu,
                        author_name,
                        author_nickname
                    FROM tickets
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """, (limit, offset))
                
                tickets = []
                for row in cursor.fetchall():
                    ticket = dict(row)
                    # 하위 호환성을 위해 view_count와 is_deleted 추가
                    ticket['view_count'] = 0
                    ticket['is_deleted'] = (ticket['status'] == 'DELETED')
                    tickets.append(ticket)
                
                return tickets

    # ===========================================
    # 감사 로그 메서드 (새 스키마 전용)
    # ===========================================
    
    def create_audit_log(self, actor, action, target_id=None, ip_address=None):
        """감사 로그 생성"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO audit_logs (actor, action, target_id, ip_address)
                    VALUES (%s, %s, %s, %s)
                    RETURNING log_id
                """, (actor, action, target_id, ip_address))
                
                log_id = cursor.fetchone()[0]
                conn.commit()
                return log_id
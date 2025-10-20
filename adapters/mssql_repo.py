"""
MSSQL Repository Implementation
Excel Repository와 동일한 인터페이스를 제공하는 MSSQL 구현체
"""
import pyodbc
import uuid
import bcrypt
from datetime import datetime
from .repo_interface import Repository

class MSSQLRepository(Repository):
    def __init__(self, conn_str):
        self.conn_str = conn_str
        try:
            self.conn = pyodbc.connect(conn_str, autocommit=False, timeout=10)
            print("✅ MSSQL 연결 성공!")
        except Exception as e:
            print(f"❌ MSSQL 연결 실패: {e}")
            raise

    def _get_connection(self):
        """새로운 연결을 반환 (연결이 끊어진 경우 재연결)"""
        try:
            # 연결 테스트
            self.conn.execute("SELECT 1")
            return self.conn
        except:
            # 재연결
            self.conn = pyodbc.connect(self.conn_str, autocommit=False)
            return self.conn

    def create_ticket(self, ticket):
        """티켓 생성"""
        try:
            print(f"📝 MSSQL 티켓 생성 시도: {ticket[0]}")
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO dbo.Tickets (
                        ticket_id, title_masked, content_enc, author_name, 
                        author_contact, post_pwd_hash, has_admin_reply, 
                        status, created_at, updated_at, agreement, snsgu
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    ticket[0],  # ticket_id
                    ticket[1],  # title
                    ticket[2],  # content
                    ticket[3],  # author_name
                    ticket[4],  # author_contact
                    ticket[5],  # pwd_hash
                    ticket[6],  # has_admin_reply
                    ticket[7],  # status
                    ticket[8],  # created_at
                    ticket[9],  # updated_at
                    ticket[10] if len(ticket) > 10 else 0,  # agreement
                    ticket[11] if len(ticket) > 11 else 'A0001'  # snsgu
                ))
                conn.commit()
                print(f"✅ MSSQL 티켓 생성 성공: {ticket[0]}")
        except Exception as e:
            print(f"❌ MSSQL 티켓 생성 실패: {e}")
            if 'conn' in locals():
                conn.rollback()
            raise

    def get_ticket(self, ticket_id):
        """티켓 조회"""
        try:
            print(f"📝 MSSQL 티켓 조회 시도: {ticket_id}")
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT ticket_id, title_masked, content_enc, author_name, 
                           author_contact, post_pwd_hash, has_admin_reply, 
                           status, created_at, updated_at, snsgu
                    FROM dbo.Tickets 
                    WHERE ticket_id = ?
                """, ticket_id)
                row = cur.fetchone()
                
                if row:
                    print(f"✅ MSSQL 티켓 조회 성공: {ticket_id}")
                    return list(row)
                else:
                    print(f"❌ MSSQL 티켓 조회 결과 없음: {ticket_id}")
                    return None
                    
        except Exception as e:
            print(f"❌ MSSQL 티켓 조회 실패: {e}")
            raise

    def list_tickets(self):
        """티켓 목록 조회"""
        conn = self._get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT ticket_id, title_masked, content_enc, author_name, 
                       author_contact, post_pwd_hash, has_admin_reply, 
                       status, created_at, updated_at, snsgu
                FROM dbo.Tickets 
                ORDER BY created_at DESC
            """)
            rows = cur.fetchall()
            result = []
            for row in rows:
                row_list = list(row)
                print(f"🔍 snsgu 값: {row_list[10]}")
                result.append(row_list)
            return result

    def update_ticket(self, ticket_id, title, content, author_name, author_contact):
        """티켓 수정"""
        try:
            print(f"📝 MSSQL 티켓 수정 시도: {ticket_id}")
            print(f"📝 수정 데이터: title='{title}', content='{content[:50]}...', author_name='{author_name}', author_contact='{author_contact}'")
            
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE dbo.Tickets 
                    SET title_masked = ?, content_enc = ?, author_name = ?, 
                        author_contact = ?, updated_at = ?
                    WHERE ticket_id = ?
                """, title, content, author_name, author_contact, 
                    datetime.now(), ticket_id)
                
                affected_rows = cur.rowcount
                conn.commit()
                
                print(f"✅ MSSQL 티켓 수정 성공: {ticket_id} (영향받은 행: {affected_rows})")
                
                if affected_rows == 0:
                    raise Exception(f"티켓 {ticket_id}를 찾을 수 없습니다")
                    
        except Exception as e:
            print(f"❌ MSSQL 티켓 수정 실패: {e}")
            if 'conn' in locals():
                conn.rollback()
            raise

    def create_message(self, message):
        """메시지 생성"""
        try:
            print(f"📝 MSSQL 메시지 생성 시도: {message[1]} ({message[2]})")
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO dbo.ThreadMessages (
                        msg_id, ticket_id, role, content_enc, created_at
                    ) VALUES (?, ?, ?, ?, ?)
                """, (
                    message[0],  # msg_id
                    message[1],  # ticket_id
                    message[2],  # role
                    message[3],  # content
                    message[4]   # created_at
                ))
                conn.commit()
                print(f"✅ MSSQL 메시지 생성 성공: {message[0]}")
                
        except Exception as e:
            print(f"❌ MSSQL 메시지 생성 실패: {e}")
            if 'conn' in locals():
                conn.rollback()
            raise

    def list_messages(self, ticket_id):
        """메시지 목록 조회"""
        try:
            print(f"📝 MSSQL 메시지 목록 조회 시도: {ticket_id}")
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT msg_id, ticket_id, role, content_enc, created_at
                    FROM dbo.ThreadMessages 
                    WHERE ticket_id = ?
                    ORDER BY created_at ASC
                """, ticket_id)
                rows = cur.fetchall()
                
                # 딕셔너리 형태로 변환
                messages = []
                for row in rows:
                    message = {
                        'msg_id': row[0],
                        'ticket_id': row[1],
                        'role': row[2],
                        'content': row[3],  # content_enc -> content로 매핑
                        'created_at': row[4]
                    }
                    messages.append(message)
                
                print(f"✅ MSSQL 메시지 조회 성공: {len(messages)}개")
                return messages
                
        except Exception as e:
            print(f"❌ MSSQL 메시지 조회 실패: {e}")
            raise

    def mark_has_admin_reply(self, ticket_id):
        """관리자 답변 여부 표시"""
        try:
            print(f"📝 MSSQL 관리자 답변 플래그 설정: {ticket_id}")
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE dbo.Tickets 
                    SET has_admin_reply = 1 
                    WHERE ticket_id = ?
                """, ticket_id)
                conn.commit()
                print(f"✅ MSSQL 관리자 답변 플래그 설정 완료: {ticket_id}")
                
        except Exception as e:
            print(f"❌ MSSQL 관리자 답변 플래그 설정 실패: {e}")
            if 'conn' in locals():
                conn.rollback()
            raise

    def get_admin_user(self, username):
        """관리자 사용자 조회"""
        try:
            print(f"📝 MSSQL 관리자 사용자 조회: {username}")
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT admin_id, username, pwd_hash
                    FROM dbo.AdminUsers 
                    WHERE username = ?
                """, username)
                row = cur.fetchone()
                
                if row:
                    print(f"✅ 관리자 사용자 조회 성공: {username}")
                    return {
                        'admin_id': row[0],
                        'username': row[1], 
                        'pwd_hash': row[2]
                    }
                else:
                    print(f"❌ 관리자 사용자를 찾을 수 없음: {username}")
                    return None
                    
        except Exception as e:
            print(f"❌ MSSQL 관리자 사용자 조회 실패: {e}")
            raise

    def create_attachment(self, attachment):
        """첨부파일 생성"""
        conn = self._get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO dbo.Attachments (
                    file_id, ticket_id, stored_path, orig_name, 
                    mime, size, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                attachment[0],  # file_id
                attachment[1],  # ticket_id
                attachment[2],  # stored_path
                attachment[3],  # orig_name
                attachment[4],  # mime
                attachment[5],  # size
                attachment[6]   # created_at
            ))
            conn.commit()

    def delete_ticket(self, ticket_id):
        """티켓 삭제 (필요시 구현)"""
        conn = self._get_connection()
        with conn.cursor() as cur:
            # 메시지 먼저 삭제
            cur.execute("DELETE FROM dbo.ThreadMessages WHERE ticket_id = ?", ticket_id)
            # 첨부파일 삭제
            cur.execute("DELETE FROM dbo.Attachments WHERE ticket_id = ?", ticket_id)
            # 티켓 삭제
            cur.execute("DELETE FROM dbo.Tickets WHERE ticket_id = ?", ticket_id)
            conn.commit()
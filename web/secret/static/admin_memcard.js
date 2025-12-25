      // ---------- Data Layer (PostgreSQL API) ----------
      const API_BASE = '/secret/api/v1/smembers';
      /** @type {Array<any>} */
      let rows = [];
      let selectedId = null; // sM_id

      // API 호출 함수들
      async function loadRows() {
        try {
          const res = await fetch(API_BASE);
          const json = await res.json();
          if (json.ok) {
            rows = json.data || [];
            console.log(`✅ 회원 ${rows.length}명 로드 완료`);
            return rows;
          } else {
            console.error('❌ 회원 로드 실패:', json.error);
            alert('회원 정보를 불러오는데 실패했습니다: ' + json.error);
            return [];
          }
        } catch (e) {
          console.error('❌ API 호출 실패:', e);
          alert('서버와 통신할 수 없습니다: ' + e.message);
          return [];
        }
      }

      async function createRow(data) {
        try {
          const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const json = await res.json();
          if (json.ok) {
            console.log('✅ 회원 생성 완료:', json.data);
            return json.data;
          } else {
            console.error('❌ 회원 생성 실패:', json.error);
            alert('회원 생성 실패: ' + json.error);
            return null;
          }
        } catch (e) {
          console.error('❌ API 호출 실패:', e);
          alert('서버와 통신할 수 없습니다: ' + e.message);
          return null;
        }
      }

      async function updateRow(sm_id, data) {
        try {
          const res = await fetch(`${API_BASE}/${sm_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const json = await res.json();
          if (json.ok) {
            console.log('✅ 회원 수정 완료:', json.data);
            return json.data;
          } else {
            console.error('❌ 회원 수정 실패:', json.error);
            alert('회원 수정 실패: ' + json.error);
            return null;
          }
        } catch (e) {
          console.error('❌ API 호출 실패:', e);
          alert('서버와 통신할 수 없습니다: ' + e.message);
          return null;
        }
      }

      async function deleteRow(sm_id) {
        try {
          const res = await fetch(`${API_BASE}/${sm_id}`, {
            method: 'DELETE',
          });
          const json = await res.json();
          if (json.ok) {
            console.log('✅ 회원 삭제 완료:', sm_id);
            return true;
          } else {
            console.error('❌ 회원 삭제 실패:', json.error);
            alert('회원 삭제 실패: ' + json.error);
            return false;
          }
        } catch (e) {
          console.error('❌ API 호출 실패:', e);
          alert('서버와 통신할 수 없습니다: ' + e.message);
          return false;
        }
      }

      // ---------- UI helpers ----------
      const qs = (s, el = document) => el.querySelector(s);
      const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

      const gridBody = qs('#gridBody');
      const countEl = qs('#count');
      const selInfo = qs('#selInfo');

      function badgeStatus(s) {
        return `<span class="badge ${s}">${s}</span>`;
      }
      function fmtDate(s) {
        if (!s) return '';
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return s;
        return d.toISOString().slice(0, 16).replace('T', ' ');
      }

      // filters
      const qInput = qs('#q');
      const sortSelect = qs('#sortBy');
      const statusFilterEl = qs('#statusFilter');
      const genderFilterEl = qs('#genderFilter');

      function getFilter() {
        const q = qInput.value.trim().toLowerCase();
        const sort = sortSelect.value;
        const statusVal = statusFilterEl ? statusFilterEl.value : 'all';
        const genderVal = genderFilterEl ? genderFilterEl.value : 'all';
        const statuses = statusVal === 'all' ? [] : [statusVal];
        const genders = genderVal === 'all' ? [] : [genderVal];
        return { statuses, genders, q, sort };
      }

      function applyFilter() {
        const f = getFilter();
        let list = rows.filter((r) => {
          const status = r.sMem_status || r.smem_status;
          const gender = r.sMem_gender || r.smem_gender;
          const name = (r.sMem_name || r.smem_name || '').toLowerCase();
          const memId = (r.sMem_id || r.smem_id || '').toLowerCase();
          const email = (r.sMem_email || r.smem_email || '').toLowerCase();
          const mobile = (r.sMem_mobile || r.smem_mobile || '').toLowerCase();
          const phone = (r.sMem_phone || r.smem_phone || '').toLowerCase();

          return (
            (f.statuses.length ? f.statuses.includes(status) : true) &&
            (f.genders.length
              ? gender
                ? f.genders.includes(gender)
                : false
              : true) &&
            (f.q
              ? name.includes(f.q) ||
                memId.includes(f.q) ||
                email.includes(f.q) ||
                mobile.includes(f.q) ||
                phone.includes(f.q)
              : true)
          );
        });
        switch (f.sort) {
          case 'name_asc':
            list.sort((a, b) =>
              (a.sMem_name || a.smem_name || '').localeCompare(
                b.sMem_name || b.smem_name || ''
              )
            );
            break;
          case 'name_desc':
            list.sort((a, b) =>
              (b.sMem_name || b.smem_name || '').localeCompare(
                a.sMem_name || a.smem_name || ''
              )
            );
            break;
          case 'id_asc':
            list.sort((a, b) =>
              (a.sMem_id || a.smem_id || '').localeCompare(
                b.sMem_id || b.smem_id || ''
              )
            );
            break;
          case 'id_desc':
            list.sort((a, b) =>
              (b.sMem_id || b.smem_id || '').localeCompare(
                a.sMem_id || a.smem_id || ''
              )
            );
            break;
          default:
            list.sort(
              (a, b) =>
                new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );
        }
        renderGrid(list);
      }

      function renderGrid(list) {
        gridBody.innerHTML = list
          .map((r) => {
            const id = r.sM_id || r.sm_id;
            const memId = r.sMem_id || r.smem_id;
            const name = r.sMem_name || r.smem_name;
            const gender = r.sMem_gender || r.smem_gender;
            const status = r.sMem_status || r.smem_status || 'OPEN';
            const createdAt = r.created_at;

            return `
      <div class="rowItem" role="row" data-id="${id}" title="선택">
        <div>${escapeHTML(memId || '')}</div>
        <div>${escapeHTML(name || '')}</div>
        <div>${gender || ''}</div>
        <div>${badgeStatus(status)}</div>
        <div>${fmtDate(createdAt)}</div>
      </div>
    `;
          })
          .join('');
        countEl.textContent = `${list.length}명`;
      }

      function escapeHTML(str) {
        return String(str).replace(
          /[&<>\"]/g,
          (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[s])
        );
      }

      // ---------- Form binding ----------
      const FIELDS = [
        'sM_id',
        'sMem_id',
        'sMem_pwdHash',
        'sMem_pwd_salt',
        'sMem_name',
        'sMem_nickname',
        'sMem_birthdt',
        'sMem_birth_year',
        'sMem_calendar_type',
        'is_leap_month',
        'sMem_gender',
        'sMem_buss_name',
        'sMem_comp_name',
        'sMem_phone',
        'sMem_mobile',
        'sMem_email',
        'zipcode',
        'address1',
        'address2',
        'zipcode_s',
        'address1_s',
        'address2_s',
        'sMem_snsgu',
        'sMem_choice1',
        'sMem_choice2',
        'sMem_choice3',
        'sMem_choice4',
        'sMem_choice5',
        'sMem_choice6',
        'sMem_choice7',
        'sMem_choice8',
        'sMem_choice9',
        'sMem_choice10',
        'sMem_choice11',
        'sMem_choice12',
        'sMem_quest',
        'sMem_content_enc',
        'old_name',
        'new_name',
        'sMemfam_id',
        'recommender',
        'applicant',
        'signature_file',
        'signature_canvas_data',
        'reference',
        'sMem_agreement',
        'sMem_agree',
        'sMem_admin_id',
        'sMem_grade',
        'sMem_status',
        'family_gu',
        'adviser_role',
        'created_at',
        'updated_at',
      ];

      function clearForm() {
        FIELDS.forEach((k) => {
          const el = qs('#' + k);
          if (!el) return;
          if (el.type === 'file') {
            el.value = '';
          } else {
            el.value = '';
          }
        });
        selectedId = null;
        selInfo.textContent = '선택 없음';

        // 서명 패드 및 미리보기 초기화
        const signPad = document.getElementById('signPad');
        const signPreview = document.getElementById('signPreviewBox');
        const natureFileDisplay = document.getElementById('natureFileDisplay');

        if (signPad) {
          const ctx = signPad.getContext('2d');
          ctx.clearRect(0, 0, signPad.width, signPad.height);
        }
        if (signPreview) {
          signPreview.innerHTML =
            '<span style="color: var(--muted)">서명 미리보기</span>';
        }
        if (natureFileDisplay) {
          natureFileDisplay.style.display = 'none';
        }
      }

      function fillForm(row) {
        console.log('📝 폼 채우기 시작:', row);

        FIELDS.forEach((k) => {
          const el = qs('#' + k);
          if (!el) {
            console.log(`   ⚠️ 요소 없음: ${k}`);
            return;
          }
          if (el.type === 'file') {
            el.value = '';
            return;
          }

          // PostgreSQL 대소문자 처리: sMem_id 또는 smem_id
          let value = row[k];
          if (value === undefined || value === null) {
            // 소문자 버전 시도
            const lowerKey = k.toLowerCase();
            value = row[lowerKey];
          }

          // 체크박스 처리
          if (el.type === 'checkbox') {
            el.checked = value === 1 || value === true || value === '1' || value === 'true';
          } else if (el.type === 'datetime-local') {
            // datetime-local 형식으로 변환 (yyyy-MM-ddThh:mm)
            if (value) {
              try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  // ISO 형식에서 datetime-local 형식으로 변환
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  el.value = `${year}-${month}-${day}T${hours}:${minutes}`;
                } else {
                  el.value = '';
                }
              } catch (e) {
                console.warn(`날짜 변환 실패: ${k} = ${value}`, e);
                el.value = '';
              }
            } else {
              el.value = '';
            }
          } else {
            el.value = value ?? '';
          }
          console.log(`   ✓ ${k} = ${el.type === 'checkbox' ? el.checked : el.value}`);
        });

        selectedId = row.sM_id || row.sm_id;
        selInfo.textContent = `선택: #${selectedId} · ${
          row.sMem_name || row.smem_name || row.sMem_id || row.smem_id || ''
        }`;

        // signature_file 경로가 있으면 서명 패드와 미리보기에 표시
        const signatureFile = row.signature_file;
        const signPad = document.getElementById('signPad');
        const signPreview = document.getElementById('signPreviewBox');
        const signatureCanvasData = document.getElementById(
          'signature_canvas_data'
        );

        if (signatureFile && signPad && signPreview) {
          console.log('🖼️ signature_file 발견:', signatureFile);

          // 이미지 파일인지 확인
          const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(signatureFile);

          if (isImage) {
            // 이미지를 캔버스에 그리기
            const img = new Image();
            img.crossOrigin = 'anonymous'; // CORS 이슈 방지

            img.onload = function () {
              const ctx = signPad.getContext('2d');
              const ratio = Math.max(window.devicePixelRatio || 1, 1);
              const cssW = signPad.clientWidth || 640;
              const cssH = signPad.clientHeight || 200;

              // 캔버스 크기 설정
              signPad.width = Math.floor(cssW * ratio);
              signPad.height = Math.floor(cssH * ratio);
              ctx.setTransform(1, 0, 0, 1, 0, 0);
              ctx.scale(ratio, ratio);

              // 이미지를 캔버스에 맞게 그리기
              const imgAspect = img.width / img.height;
              const canvasAspect = cssW / cssH;
              let drawWidth, drawHeight, offsetX, offsetY;

              if (imgAspect > canvasAspect) {
                // 이미지가 더 넓음 - 너비 기준
                drawWidth = cssW;
                drawHeight = cssW / imgAspect;
                offsetX = 0;
                offsetY = (cssH - drawHeight) / 2;
              } else {
                // 이미지가 더 높음 - 높이 기준
                drawHeight = cssH;
                drawWidth = cssH * imgAspect;
                offsetX = (cssW - drawWidth) / 2;
                offsetY = 0;
              }

              ctx.clearRect(0, 0, cssW, cssH);
              ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

              // canvas 데이터를 hidden input에 저장
              try {
                const dataUrl = signPad.toDataURL('image/png');
                if (signatureCanvasData) {
                  signatureCanvasData.value = dataUrl;
                }
              } catch (err) {
                console.error('캔버스 데이터 저장 오류:', err);
              }

              console.log('✅ 서명 이미지를 캔버스에 그렸습니다.');
            };

            img.onerror = function () {
              console.error('❌ 이미지 로드 실패:', signatureFile);
              signPreview.innerHTML = `<span style="color: var(--danger);">이미지 로드 실패</span>`;
            };

            img.src = signatureFile;

            // 미리보기에도 표시
            signPreview.innerHTML = `<img src="${signatureFile}" alt="서명" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;
          } else {
            // 이미지가 아닌 경우 경로만 표시
            signPreview.innerHTML = `<div style="text-align: left; padding: 10px;">
              <strong>서명 파일:</strong><br>
              <a href="${signatureFile}" target="_blank" style="color: var(--brand); word-break: break-all;">${signatureFile}</a>
            </div>`;
          }
        } else if (signPreview) {
          // signature_file이 없으면 초기화
          signPreview.innerHTML =
            '<span style="color: var(--muted)">서명 미리보기</span>';
          if (signatureCanvasData) {
            signatureCanvasData.value = '';
          }
        }

        // nature_file 경로가 있으면 표시
        const natureFile =
          row.nature_file || row.sMem_nature_file || row.smem_nature_file;
        const natureFileDisplay = document.getElementById('natureFileDisplay');
        const natureFilePreview = document.getElementById('natureFilePreview');

        if (natureFile && natureFileDisplay && natureFilePreview) {
          natureFileDisplay.style.display = 'block';

          // 이미지 파일인지 확인
          const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(natureFile);

          if (isImage) {
            // 이미지로 표시
            natureFilePreview.innerHTML = `<img src="${natureFile}" alt="서명 이미지" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;
          } else {
            // 파일 경로만 표시
            natureFilePreview.innerHTML = `<div style="text-align: left; padding: 10px;">
              <strong>파일 경로:</strong><br>
              <a href="${natureFile}" target="_blank" style="color: var(--brand); word-break: break-all;">${natureFile}</a>
            </div>`;
          }
        } else if (natureFileDisplay) {
          natureFileDisplay.style.display = 'none';
        }

        console.log('✅ 폼 채우기 완료, selectedId:', selectedId);
      }

      function collectForm() {
        const o = {};
        FIELDS.forEach((k) => {
          const el = qs('#' + k);
          if (!el) return;
          if (el.type === 'file') {
            return;
          }
          // 체크박스 처리
          if (el.type === 'checkbox') {
            o[k] = el.checked ? 1 : 0;
          } else {
            o[k] = el.value;
          }
        });
        
        // 비밀번호가 입력되었으면 해시 생성 (서버에서도 처리하지만 미리 생성)
        const passwordInput = qs('#sMem_password');
        if (passwordInput && passwordInput.value) {
          // 비밀번호는 평문으로 전송하고 서버에서 해시 처리
          // 여기서는 해시 필드를 비워서 서버에서 처리하도록 함
          o.sMem_password = passwordInput.value;
        }
        
        [
          'sM_id',
          'sMem_birth_year',
          'sMem_choice1',
          'sMem_choice2',
          'sMem_choice3',
          'sMem_choice4',
          'sMem_choice5',
          'sMem_choice6',
          'sMem_choice7',
          'sMem_choice8',
          'sMem_choice9',
          'sMem_choice10',
          'sMem_choice11',
          'sMem_choice12',
          'sMem_agreement',
          'sMem_agree',
          'is_leap_month',
        ].forEach((k) => {
          if (o[k] !== '' && o[k] != null && o[k] !== undefined) {
            o[k] = Number(o[k]);
          }
        });
        return o;
      }

      // ---------- CRUD ----------
      function nextId() {
        return rows.length ? Math.max(...rows.map((r) => r.sM_id || 0)) + 1 : 1;
      }

      async function upsert() {
        const o = collectForm();
        if (!o.sMem_id) {
          alert('멤버 ID는 필수입니다.');
          return;
        }
        
        // 비밀번호 검증: 비밀번호 입력 필드 또는 해시 필드가 있어야 함
        const passwordInput = qs('#sMem_password');
        const password = passwordInput ? passwordInput.value : '';
        if (!password && !o.sMem_pwdHash) {
          alert('비밀번호는 필수입니다. 비밀번호를 입력하거나 해시 값을 입력하세요.');
          return;
        }
        
        // 비밀번호가 입력되었으면 평문으로 전송 (서버에서 해시 처리)
        if (password) {
          o.sMem_pwdHash = password; // 서버에서 해시 처리하도록 평문 전송
        }
        
        // is_leap_month는 smem_yundal로 저장되므로 삭제하지 않음

        // 서명 파일 관련 필드는 제거 (a02_admin_memcard.html에서는 서명 파일 처리 불필요)
        delete o.signature_file;
        delete o.signature_canvas_data;

        if (selectedId == null) {
          // create
          if (
            rows.some(
              (r) =>
                (r.sMem_id || r.smem_id || '').toLowerCase() ===
                o.sMem_id.toLowerCase()
            )
          ) {
            alert('이미 존재하는 멤버 ID 입니다.');
            return;
          }

          if (!o.sMem_status) o.sMem_status = 'OPEN';
          if (!o.family_gu) o.family_gu = '01';
          if (!o.adviser_role) o.adviser_role = 'A';

          const newMember = await createRow(o);
          if (newMember) {
            await loadRows();
            applyFilter();
            selectById(newMember.sm_id);
            alert('등록되었습니다.');
          }
        } else {
          // update
          const idx = rows.findIndex(
            (r) => (r.sM_id || r.sm_id) === selectedId
          );
          if (idx < 0) {
            alert('선택 레코드가 없습니다.');
            return;
          }
          if (
            rows.some(
              (r) =>
                (r.sM_id || r.sm_id) !== selectedId &&
                (r.sMem_id || r.smem_id || '').toLowerCase() ===
                  o.sMem_id.toLowerCase()
            )
          ) {
            alert('이미 존재하는 멤버 ID 입니다.');
            return;
          }

          const updatedMember = await updateRow(selectedId, o);
          if (updatedMember) {
            await loadRows();
            applyFilter();
            selectById(selectedId);
            alert('수정되었습니다.');
          }
        }
      }

      // 수정 전용 함수
      async function updateMember() {
        if (selectedId == null) {
          alert('수정할 회원을 먼저 선택하세요.');
          return;
        }
        
        const o = collectForm();
        if (!o.sMem_id) {
          alert('멤버 ID는 필수입니다.');
          return;
        }
        
        // 수정 시 비밀번호 처리: 비밀번호가 입력되었을 때만 업데이트
        const passwordInput = qs('#sMem_password');
        const password = passwordInput ? passwordInput.value.trim() : '';
        
        // 비밀번호가 입력되지 않았으면 비밀번호 필드 제거 (기존 값 유지)
        if (!password) {
          delete o.sMem_pwdHash;
          delete o.sMem_pwd_salt;
        } else {
          // 새 비밀번호가 입력되었으면 해시 처리하도록 평문 전송
          o.sMem_pwdHash = password;
        }
        
        // is_leap_month는 smem_yundal로 저장되므로 삭제하지 않음

        // 서명 파일 관련 필드는 제거 (a02_admin_memcard.html에서는 서명 파일 처리 불필요)
        delete o.signature_file;
        delete o.signature_canvas_data;
        
        const idx = rows.findIndex(
          (r) => (r.sM_id || r.sm_id) === selectedId
        );
        if (idx < 0) {
          alert('선택 레코드가 없습니다.');
          return;
        }
        
        // ID 중복 체크 (자기 자신 제외)
        if (
          rows.some(
            (r) =>
              (r.sM_id || r.sm_id) !== selectedId &&
              (r.sMem_id || r.smem_id || '').toLowerCase() ===
                o.sMem_id.toLowerCase()
          )
        ) {
          alert('이미 존재하는 멤버 ID 입니다.');
          return;
        }

        const updatedMember = await updateRow(selectedId, o);
        if (updatedMember) {
          await loadRows();
          applyFilter();
          selectById(selectedId);
          alert('✅ 회원 정보가 수정되었습니다.');
        }
      }

      async function remove() {
        if (selectedId == null) {
          alert('삭제할 항목을 먼저 선택하세요.');
          return;
        }
        const idx = rows.findIndex((r) => (r.sM_id || r.sm_id) === selectedId);
        if (idx < 0) return;
        if (!confirm('정말 삭제하시겠습니까? (영구 삭제)')) return;

        const success = await deleteRow(selectedId);
        if (success) {
          await loadRows();
          applyFilter();
          clearForm();
          alert('삭제되었습니다.');
        }
      }

      function selectById(id) {
        console.log('🔍 ID로 선택:', id);
        console.log('   전체 rows:', rows.length);

        const row = rows.find((r) => {
          const rowId = r.sM_id || r.sm_id;
          console.log(`   비교: ${rowId} === ${id}`, rowId === id);
          return rowId === id;
        });

        if (row) {
          console.log('✅ 찾은 데이터:', row);
          fillForm(row);
          highlightRow(id);
        } else {
          console.log('❌ 데이터를 찾을 수 없습니다. ID:', id);
        }
      }
      function highlightRow(id) {
        qsa('.rowItem').forEach((el) => {
          el.style.background = '';
        });
        const el = qs(`.rowItem[data-id="${id}"]`);
        if (el) {
          el.style.background =
            'color-mix(in oklab, var(--panel) 80%, var(--bg))';
          el.scrollIntoView({ block: 'nearest' });
        }
      }

      // ---------- Export/Import ----------
      function exportJSON() {
        const blob = new Blob([JSON.stringify(rows, null, 2)], {
          type: 'application/json',
        });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sMembers_dataset.json';
        a.click();
        URL.revokeObjectURL(a.href);
      }
      function importJSON(file) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            if (!Array.isArray(data)) throw new Error('배열 형식이 아님');
            rows = data;
            persist(rows);
            applyFilter();
            clearForm();
            alert('불러왔습니다.');
          } catch (e) {
            alert('JSON 형식 오류: ' + e.message);
          }
        };
        reader.readAsText(file);
      }

      // ---------- Theme ----------
      let theme = localStorage.getItem('smembers_theme') || 'light';
      function applyTheme() {
        document.documentElement.setAttribute(
          'data-theme',
          theme === 'dark' ? 'dark' : 'light'
        );
        localStorage.setItem('smembers_theme', theme);
      }

      // ---------- Mock fill ----------
      function fillOneMock() {
        const nowISO = new Date().toISOString().slice(0, 16);
        const t = {
          sMem_id: 'user' + Math.random().toString(36).slice(2, 7),
          sMem_pwdHash: '***',
          sMem_pwd_salt: '',
          sMem_name: '새사용자',
          sMem_nickname: 'newbie',
          sMem_birthdt: '1999-01-01',
          sMem_birth_year: 1999,
          sMem_calendar_type: 'solar',
          sMem_gender: 'M',
          sMem_buss_name: '',
          sMem_comp_name: '',
          sMem_phone: '',
          sMem_mobile: '010-0000-0000',
          sMem_email: 'new@example.com',
          zipcode: '',
          address1: '',
          address2: '',
          zipcode_s: '',
          address1_s: '',
          address2_s: '',
          sMem_snsgu: '일반',
          sMem_choice1: 0,
          sMem_choice2: 0,
          sMem_choice3: 0,
          sMem_choice4: 0,
          sMem_choice5: 0,
          sMem_choice6: 0,
          sMem_choice7: 0,
          sMem_choice8: 0,
          sMem_choice9: 0,
          sMem_choice10: 0,
          sMem_choice11: 0,
          sMem_choice12: 0,
          sMem_quest: '',
          sMem_content_enc: '',
          old_name: '',
          new_name: '',
          sMemfam_id: '',
          recommender: '',
          applicant: '',
          signature_file: '',
          reference: '',
          sMem_agreement: 0,
          sMem_agree: 0,
          sMem_admin_id: '',
          sMem_grade: '',
          sMem_status: 'OPEN',
          family_gu: '01',
          adviser_role: 'A',
          created_at: nowISO,
          updated_at: nowISO,
        };
        fillForm(t);
      }

      // ---------- Init & Events ----------
      async function init() {
        applyTheme();
        await loadRows();
        applyFilter();

        // Resizer for grid width
        const resizer = document.getElementById('resizer');
        const layout = document.querySelector('.layout');
        let isResizing = false;
        let startX = 0;
        let startWidth = 380;

        // Load saved width
        const savedWidth = localStorage.getItem('gridWidth');
        if (savedWidth) {
          const width = parseInt(savedWidth);
          if (width >= 280 && width <= 900) {
            document.documentElement.style.setProperty(
              '--grid-width',
              width + 'px'
            );
          }
        }

        if (resizer) {
          resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            const currentWidth = getComputedStyle(
              document.documentElement
            ).getPropertyValue('--grid-width');
            startWidth = parseInt(currentWidth) || 380;
            resizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
          });

          document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            e.preventDefault();
            const deltaX = e.clientX - startX;
            let newWidth = startWidth + deltaX;

            // Min/Max constraints
            newWidth = Math.max(280, Math.min(900, newWidth));

            document.documentElement.style.setProperty(
              '--grid-width',
              newWidth + 'px'
            );
          });

          document.addEventListener('mouseup', () => {
            if (isResizing) {
              isResizing = false;
              resizer.classList.remove('resizing');
              document.body.style.cursor = '';
              document.body.style.userSelect = '';

              // Save width
              const currentWidth = getComputedStyle(
                document.documentElement
              ).getPropertyValue('--grid-width');
              localStorage.setItem('gridWidth', parseInt(currentWidth) || 380);
            }
          });
        }

        // Grid select
        gridBody.addEventListener('click', (e) => {
          const row = e.target.closest('.rowItem');
          if (!row) return;
          const id = Number(row.dataset.id);
          selectById(id);
        });

        // Filters
        if (statusFilterEl)
          statusFilterEl.addEventListener('change', applyFilter);
        if (genderFilterEl)
          genderFilterEl.addEventListener('change', applyFilter);
        qInput.addEventListener('input', applyFilter);
        sortSelect.addEventListener('change', applyFilter);
        document.getElementById('btnClear').addEventListener('click', () => {
          if (statusFilterEl) statusFilterEl.value = 'all';
          if (genderFilterEl) genderFilterEl.value = 'all';
          qInput.value = '';
          sortSelect.value = 'created_at_desc';
          applyFilter();
        });

        // CRUD buttons
        document.getElementById('btnNew').addEventListener('click', () => {
          clearForm();
          fillOneMock();
        });
        document.getElementById('btnSave').addEventListener('click', upsert);
        document.getElementById('btnUpdate').addEventListener('click', updateMember);
        document.getElementById('btnDelete').addEventListener('click', remove);
        document.getElementById('btnReset').addEventListener('click', () => {
          if (selectedId != null) selectById(selectedId);
          else clearForm();
        });

        // Close button
        document.getElementById('btnClose').addEventListener('click', () => {
          // iframe 내부에서 실행 중인지 확인
          if (window.self !== window.top) {
            // iframe 내부에서 실행 중: 부모 창으로 돌아가기
            window.parent.postMessage('closeIframe', '*');
          } else {
            // 독립 창에서 실행 중: 창 닫기
            window.close();
          }
        });

        // Theme
        document.getElementById('btnTheme').addEventListener('click', () => {
          theme = theme === 'dark' ? 'light' : 'dark';
          applyTheme();
        });

        // Import/Export
        document
          .getElementById('btnExport')
          .addEventListener('click', exportJSON);
        document
          .getElementById('btnImport')
          .addEventListener('click', () =>
            document.getElementById('jsonFile').click()
          );
        document.getElementById('jsonFile').addEventListener('change', (e) => {
          const f = e.target.files?.[0];
          if (f) importJSON(f);
          e.target.value = '';
        });

        // Keyboard UX
        document.addEventListener('keydown', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            upsert();
          }
        });

        // ===== 음력 선택 시 윤달여부 체크박스 표시/숨김 =====
        const calendarTypeSelect = qs('#sMem_calendar_type');
        const leapMonthCtrl = qs('#leapMonthCtrl');
        if (calendarTypeSelect && leapMonthCtrl) {
          function toggleLeapMonthCtrl() {
            const calendarType = calendarTypeSelect.value;
            if (calendarType === '음력' || calendarType === '윤달') {
              leapMonthCtrl.style.display = 'grid';
            } else {
              leapMonthCtrl.style.display = 'none';
              const leapCheckbox = qs('#is_leap_month');
              if (leapCheckbox) leapCheckbox.checked = false;
            }
          }
          calendarTypeSelect.addEventListener('change', toggleLeapMonthCtrl);
          // 초기 상태 설정
          toggleLeapMonthCtrl();
        }

        // ===== 비밀번호 입력 시 해시 생성 (서버에서 처리하지만 미리보기) =====
        const passwordInput = qs('#sMem_password');
        if (passwordInput) {
          passwordInput.addEventListener('input', async function() {
            const password = this.value;
            if (password && password.length > 0) {
              // 비밀번호가 입력되면 서버에 해시 요청 (또는 클라이언트에서 처리)
              // 여기서는 서버에서 처리하도록 하고, 해시 필드는 비워둠
              // 서버 API에서 비밀번호를 받아서 해시 처리
            } else {
              // 비밀번호가 비어있으면 해시 필드도 비움
              const hashInput = qs('#sMem_pwdHash');
              const saltInput = qs('#sMem_pwd_salt');
              if (hashInput) hashInput.value = '';
              if (saltInput) saltInput.value = '';
            }
          });
        }

        // ===== 서명 패드 기능 =====
        (function initSignaturePad() {
          const pad = document.getElementById('signPad');
          const clearBtn = document.getElementById('signClear');
          const saveBtn = document.getElementById('signSave');
          const preview = document.getElementById('signPreviewBox');
          const status = document.getElementById('signStatus');
          const hidden = document.getElementById('signature_canvas_data');
          const penColor = document.getElementById('penColor');
          const penWidth = document.getElementById('penWidth');

          if (!pad || !clearBtn || !saveBtn || !preview || !hidden) return;

          // HiDPI 대응
          function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const cssW = pad.clientWidth || 640;
            const cssH = pad.clientHeight || 200;
            pad.width = Math.floor(cssW * ratio);
            pad.height = Math.floor(cssH * ratio);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(ratio, ratio);
          }

          const ctx = pad.getContext('2d');
          ctx.lineWidth = parseFloat(penWidth?.value || '2.5');
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = penColor?.value || '#111';

          let drawing = false;
          let points = [];

          function posFromEvent(e) {
            const rect = pad.getBoundingClientRect();
            if (e.touches && e.touches[0]) {
              return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
              };
            }
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
          }

          function drawLine(p1, p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          function start(e) {
            drawing = true;
            points = [];
            points.push(posFromEvent(e));
            e.preventDefault();
          }

          function move(e) {
            if (!drawing) return;
            const p = posFromEvent(e);
            const q = points[points.length - 1];
            drawLine(q, p);
            points.push(p);
            e.preventDefault();
          }

          function end(e) {
            drawing = false;
            e.preventDefault();
          }

          pad.addEventListener('mousedown', start);
          pad.addEventListener('mousemove', move);
          window.addEventListener('mouseup', end);

          pad.addEventListener('touchstart', start, { passive: false });
          pad.addEventListener('touchmove', move, { passive: false });
          pad.addEventListener('touchend', end, { passive: false });

          window.addEventListener('resize', resizeCanvas);
          resizeCanvas();

          function setStatus(msg) {
            if (status) {
              status.textContent = msg;
            }
          }

          function setPreview(dataUrl) {
            preview.innerHTML = '';
            if (dataUrl) {
              const img = new Image();
              img.src = dataUrl;
              img.style.maxWidth = '100%';
              img.style.maxHeight = '200px';
              img.style.objectFit = 'contain';
              preview.appendChild(img);
            } else {
              preview.innerHTML =
                '<span style="color:var(--muted)">서명 미리보기</span>';
            }
          }

          clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, pad.width, pad.height);
            resizeCanvas();
            hidden.value = '';
            setPreview('');
            setStatus('서명이 초기화되었습니다.');
          });

          saveBtn.addEventListener('click', () => {
            try {
              const dataUrl = pad.toDataURL('image/png');
              if (!dataUrl || dataUrl.length < 5000) {
                alert('서명이 너무 짧거나 없습니다. 다시 서명해 주세요.');
                return;
              }
              hidden.value = dataUrl;
              setPreview(dataUrl);
              setStatus('서명이 저장되었습니다.');
            } catch (err) {
              console.error(err);
              setStatus('서명 저장 중 오류가 발생했습니다.');
            }
          });

          // 색/굵기 옵션 즉시 반영
          penColor?.addEventListener('input', (e) => {
            ctx.strokeStyle = e.target.value;
          });
          penWidth?.addEventListener('input', (e) => {
            ctx.lineWidth = parseFloat(e.target.value || '2.5');
          });
        })();
      }

      init();

      // 관리자 로그인 체크
      (function checkAdminLogin() {
        // admin_session.js가 로드될 때까지 최대 1초 대기 (재시도 로직)
        let attempts = 0;
        const maxAttempts = 10; // 10번 시도 (약 1초)
        
        function tryCheckAdmin() {
          attempts++;
          
          // admin_session.js가 로드되었는지 확인
          if (typeof window.getAdminSession === 'function') {
            const adminSession = window.getAdminSession();

            // 관리자 세션이 없거나 로그인 상태가 아니면 로그인 페이지로 리다이렉트
            if (
              !adminSession ||
              !adminSession.isLoggedIn ||
              !adminSession.admin_id
            ) {
              console.warn('⚠️ 관리자 로그인 정보가 없습니다.');
              alert('관리자 로그인이 필요합니다.');
              window.location.href = '/secret/admin_login';
              return;
            }

            console.log('✅ 관리자 인증 완료:', adminSession.username);
          } else {
            // 아직 로드되지 않았으면 재시도
            if (attempts < maxAttempts) {
              setTimeout(tryCheckAdmin, 100); // 100ms 후 재시도
            } else {
              // 최대 시도 횟수 초과
              console.error('❌ admin_session.js가 로드되지 않았습니다.');
              console.error('   스크립트 로드 순서를 확인하세요.');
              alert('관리자 세션 관리 스크립트를 로드할 수 없습니다.\n\n페이지를 새로고침해주세요.');
              window.location.href = '/secret/admin_login';
            }
          }
        }
        
        // 즉시 실행 또는 DOMContentLoaded 후 실행
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', tryCheckAdmin);
        } else {
          tryCheckAdmin();
        }
      })();


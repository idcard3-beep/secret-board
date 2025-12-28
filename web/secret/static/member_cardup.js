/* ====== 다크/라이트 토글 (원본 유지) ====== */
      (function themeInit() {
        const btn = document.getElementById('themeBtn');
        const saved = localStorage.getItem('theme');
        if (saved) document.documentElement.setAttribute('data-theme', saved);
        btn.textContent =
          document.documentElement.getAttribute('data-theme') === 'dark'
            ? '다크'
            : '라이트';
        btn.setAttribute(
          'aria-pressed',
          document.documentElement.getAttribute('data-theme') === 'dark'
        );
        btn.addEventListener('click', () => {
          const cur = document.documentElement.getAttribute('data-theme');
          const next = cur === 'dark' ? '' : 'dark';
          if (next) document.documentElement.setAttribute('data-theme', next);
          else document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', next);
          btn.textContent = next === 'dark' ? '다크' : '라이트';
          btn.setAttribute('aria-pressed', next === 'dark');
        });
      })();

      /* ====== 단계 제어/검증/요약 (필요 최소 변경: 총단계 6, 요약 단계 6) ====== */
      (() => {
        // 프로토콜 강제 함수 (Mixed Content 오류 방지)
        function getSecureProtocol() {
          let protocol = window.location.protocol;
          const host = window.location.host;
          
          // 부모 페이지가 있으면 부모의 프로토콜 확인 (iframe 내부인 경우)
          if (window.parent && window.parent !== window) {
            try {
              const parentProtocol = window.parent.location.protocol;
              if (parentProtocol === 'https:') {
                protocol = 'https:';
              }
            } catch (e) {
              // Cross-origin 오류 무시 (정상)
            }
          }
          
          // 프로덕션 환경에서는 항상 HTTPS 강제
          if (host !== 'localhost' && host !== '127.0.0.1' && !host.includes('localhost:')) {
            if (protocol !== 'https:') {
              console.warn('⚠️ HTTPS가 아닌 프로토콜 감지, HTTPS로 강제 변경');
              protocol = 'https:';
            }
          }
          
          return protocol;
        }
        
        // 안전한 API URL 생성 함수
        function getApiUrl(path) {
          const protocol = getSecureProtocol();
          const host = window.location.host;
          return `${protocol}//${host}${path.startsWith('/') ? path : '/' + path}`;
        }
        
        const form = document.getElementById('form');
        const stepsEls = [...document.querySelectorAll('#steps span')];
        const sections = [...document.querySelectorAll('[data-step]')];
        const progressBar = document.getElementById('bar');
        let cur = 1,
          total = sections.length;

        const reqByStep = {
          1: ['agree_terms', 'agree_privacy'],
          2: [
            'sMem_id',
            'sMem_pwdHash',
            'pwd2',
            'sMem_name',
            'sMem_calendar_type',
            'sMem_gender',
          ],
          3: ['sMem_mobile', 'sMem_email'],
          4: [],
          5: ['signature_canvas_data'] /* (추가) 5단계 서명 필수 */,
          6: [],
        };

        function setProgress() {
          progressBar.style.width = ((cur - 1) / (total - 1)) * 100 + '%';
          stepsEls.forEach((s, i) => s.classList.toggle('active', i < cur));
        }
        function show(n) {
          sections.forEach((sec) => (sec.hidden = +sec.dataset.step !== n));
          cur = n;
          setProgress();
          if (cur === 6) renderSummary();
        }
        async function next() {
          if (!validate(cur)) return;
          if (cur < total) {
            // 6단계(최종 확인)로 이동하기 전에 서명 파일 업로드
            if (cur === 5) {
              console.log('🔄 5단계 → 6단계 이동 전 서명 파일 업로드 시작...');
              await uploadSignatureBeforeConfirm();
              console.log('✅ 서명 파일 업로드 완료, window.uploadedSignaturePath:', window.uploadedSignaturePath);
            }
            show(cur + 1);
            // 6단계로 이동한 경우, 업로드 완료 후 renderSummary()를 다시 호출하여 최신 데이터 반영
            if (cur === 6) {
              console.log('🔄 6단계 renderSummary() 재호출 (업로드 완료 후)...');
              console.log('📁 현재 window.uploadedSignaturePath:', window.uploadedSignaturePath);
              renderSummary();
            }
            saveDraft();
          }
        }
        
        // 최종 확인 페이지로 이동하기 전에 서명 파일 업로드
        async function uploadSignatureBeforeConfirm() {
          const payload = collect();
          
          // 1. 서명 파일 입력 필드에서 파일이 선택된 경우 업로드
          const signatureFileInput = document.getElementById('signature_file');
          if (signatureFileInput && signatureFileInput.files && signatureFileInput.files[0]) {
            try {
              console.log('📤 최종 확인 전 서명 파일 업로드 시작 (파일 입력)...');
              
              const formData = new FormData();
              const fileName = `${payload.sMem_id || 'signature'}_${payload.sMem_name || 'member'}.png`;
              formData.append('file', signatureFileInput.files[0], fileName);

              // Mixed Content 오류 방지: 안전한 프로토콜 사용
              const uploadUrl = getApiUrl('/secret/api/v1/files/upload-signature');
              const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'same-origin',
              });

              if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('❌ 서명 파일 업로드 실패:', uploadResponse.status, errorText);
              } else {
                const uploadResult = await uploadResponse.json();
                if (uploadResult.ok && uploadResult.path) {
                  window.uploadedSignaturePath = uploadResult.path;
                  console.log('✅ 서명 파일 업로드 성공 (파일 입력):', uploadResult.path);
                  console.log('📁 window.uploadedSignaturePath 설정됨:', window.uploadedSignaturePath);
                  return; // 파일 입력이 우선
                }
              }
            } catch (error) {
              console.error('서명 파일 업로드 오류:', error);
            }
          }
          
          // 2. 서명 캔버스 데이터가 있으면 업로드
          if (
            payload.signature_canvas_data &&
            payload.signature_canvas_data.startsWith('data:image')
          ) {
            try {
              console.log('📤 최종 확인 전 서명 파일 업로드 시작 (캔버스)...');
              
              // Base64 이미지를 Blob으로 변환
              const response = await fetch(payload.signature_canvas_data);
              const blob = await response.blob();

              // FormData 생성
              const formData = new FormData();
              const fileName = `${payload.sMem_id || 'signature'}_${payload.sMem_name || 'member'}.png`;
              formData.append('file', blob, fileName);

              // 서명 이미지 업로드
              // Mixed Content 오류 방지: 안전한 프로토콜 사용
              const uploadUrl = getApiUrl('/secret/api/v1/files/upload-signature');
              const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'same-origin',
              });

              if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('❌ 서명 이미지 업로드 실패:', uploadResponse.status, errorText);
                return;
              }

              const uploadResult = await uploadResponse.json();

              if (uploadResult.ok && uploadResult.path) {
                window.uploadedSignaturePath = uploadResult.path;
                console.log('✅ 서명 이미지 업로드 성공 (캔버스):', uploadResult.path);
                console.log('📁 window.uploadedSignaturePath 설정됨:', window.uploadedSignaturePath);
              } else {
                console.warn('⚠️ 서명 이미지 업로드 실패:', uploadResult.error);
              }
            } catch (error) {
              console.error('서명 이미지 업로드 오류:', error);
            }
          }
        }
        function prev() {
          if (cur > 1) show(cur - 1);
        }

        document
          .querySelectorAll('[data-next]')
          .forEach((b) => b.addEventListener('click', next));
        document
          .querySelectorAll('[data-prev]')
          .forEach((b) => b.addEventListener('click', prev));

        /* 기본↔별도 주소 동기화 체크 (원본 유지) */
        const copyAddr = document.getElementById('copyAddr');
        copyAddr?.addEventListener('change', () => {
          ['zipcode', 'address1', 'address2'].forEach((k) => {
            const src = document.getElementById(k),
              dst = document.getElementById(k + '_s');
            if (!src || !dst) return;
            if (copyAddr.checked) {
              dst.value = src.value;
              dst.readOnly = true;
            } else {
              dst.readOnly = false;
            }
          });
        });

        /* 서명 파일 미리보기/간단도구 (원본 유지) */
        const sigInput = document.getElementById('signature_file');
        const sigPrev = document.getElementById('sigPreview');
        let originalUrl = null,
          displayUrl = null,
          rotation = 0;

        sigInput?.addEventListener('change', () => {
          const f = sigInput.files?.[0];
          sigPrev.innerHTML =
            '<span style="color:var(--ink-sub)">미리보기</span>';
          rotation = 0;
          URL.revokeObjectURL(originalUrl);
          URL.revokeObjectURL(displayUrl);
          if (f) {
            const okType = ['image/png', 'image/jpeg', 'image/webp'].includes(
              f.type
            );
            if (!okType) {
              alert('PNG/JPEG/WebP만 업로드 가능합니다.');
              sigInput.value = '';
              return;
            }
            if (f.size > 2 * 1024 * 1024) {
              alert('파일 용량은 최대 2MB까지 허용됩니다.');
              sigInput.value = '';
              return;
            }
            originalUrl = URL.createObjectURL(f);
            displayUrl = originalUrl;
            renderPreview();
          }
        });

        function renderPreview() {
          if (!displayUrl) {
            sigPrev.innerHTML =
              '<span style="color:var(--ink-sub)">미리보기</span>';
            return;
          }
          sigPrev.innerHTML = '';
          const img = new Image();
          img.onload = () => {
            sigPrev.innerHTML = '';
            sigPrev.appendChild(img);
          };
          img.src = displayUrl + '#' + Math.random();
          img.style.transform = `rotate(${rotation}deg)`;
          img.style.transition = 'transform .2s ease';
        }
        document.getElementById('rotateBtn')?.addEventListener('click', () => {
          if (!displayUrl) return;
          rotation = (rotation + 90) % 360;
          renderPreview();
        });
        document.getElementById('cropBtn')?.addEventListener('click', () => {
          if (!displayUrl) return;
          const img = new Image();
          img.onload = () => {
            const side = Math.min(img.width, img.height);
            const sx = Math.floor((img.width - side) / 2);
            const sy = Math.floor((img.height - side) / 2);
            const canvas = document.createElement('canvas');
            canvas.width = side;
            canvas.height = side;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, sx, sy, side, side, 0, 0, side, side);
            displayUrl = canvas.toDataURL('image/png');
            rotation = 0;
            renderPreview();
          };
          img.src = displayUrl;
        });
        document
          .getElementById('resetImgBtn')
          ?.addEventListener('click', () => {
            if (!originalUrl) return;
            displayUrl = originalUrl;
            rotation = 0;
            renderPreview();
          });

        /* 입력 검증 강화 (원본 유지) */
        const m = document.getElementById('sMem_mobile');
        m?.addEventListener('input', () => {
          let v = m.value.replace(/[^\d]/g, '');
          if (v.startsWith('010')) {
            if (v.length > 3 && v.length <= 7)
              v = v.replace(/^(\d{3})(\d+)/, '$1-$2');
            else if (v.length > 7)
              v = v.replace(/^(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
          } else {
            if (v.length > 3) v = v.replace(/^(\d{3})(\d+)/, '$1-$2');
            if (v.length > 8) v = v.replace(/^(\d+)-(\d{4})(\d+)/, '$1-$2-$3');
          }
          m.value = v.slice(0, 13);
        });
        const email = document.getElementById('sMem_email');

        // 아이디 중복 확인 상태 추적 변수
        let isIdChecked = false;
        let lastCheckedId = '';

        const id = document.getElementById('sMem_id');
        const idOk = document.getElementById('idOk');
        const idBtn = document.getElementById('idCheckBtn');

        // 아이디 입력 필드 변경 시 중복확인 상태 초기화
        id?.addEventListener('input', () => {
          if (id.value.trim() !== lastCheckedId) {
            isIdChecked = false;
            idOk.style.display = 'none';
          }
        });

        idBtn?.addEventListener('click', async () => {
          const v = (id.value || '').trim();
          idOk.style.display = 'none';
          isIdChecked = false;

          if (!v) {
            alert('아이디를 입력하세요.');
            id.focus();
            return;
          }

          // 입력한 아이디로 직접 중복 확인
          try {
            console.log('🔍 아이디 중복 확인 시작:', v);
            // Mixed Content 오류 방지: 안전한 프로토콜 사용
            const checkUrl = getApiUrl(`/secret/api/v1/smembers/check/${encodeURIComponent(v)}`);
            const response = await fetch(checkUrl, {
              mode: 'cors',
              credentials: 'same-origin',
            });
            console.log('📡 API 응답 상태:', response.status);

            const result = await response.json();
            console.log('📋 API 응답 데이터:', result);

            if (result.exists) {
              alert('❌ 이미 사용 중인 아이디입니다.');
              id.focus();
              isIdChecked = false;
              lastCheckedId = '';
            } else {
              alert('✅ 사용 가능한 아이디입니다.');
              idOk.style.display = 'block';
              isIdChecked = true;
              lastCheckedId = v;
              setTimeout(() => (idOk.style.display = 'none'), 3000);
            }
          } catch (error) {
            console.error('❌ 아이디 중복 확인 오류:', error);
            alert('❌ 서버 연결 오류가 발생했습니다.');
            isIdChecked = false;
          }
        });

        /* 비밀번호 토글 + 강도 (원본 유지) */
        const pwd = document.getElementById('sMem_pwdHash');
        const pwd2 = document.getElementById('pwd2');
        const pwdToggle = document.getElementById('pwdToggle');
        const pwdBar = document.getElementById('pwdStrengthBar');
        const pwdLabel = document.getElementById('pwdStrengthTxt');

        pwdToggle?.addEventListener('click', () => {
          const t = pwd.type === 'password' ? 'text' : 'password';
          pwd.type = t;
          pwd2.type = t;
          pwdToggle.textContent = t === 'text' ? '숨기기' : '보기';
        });
        pwd?.addEventListener('input', () => {
          const s = scorePwd(pwd.value);
          pwdBar.style.width = Math.min(s * 25, 100) + '%';
          const txt = ['매우 약함', '약함', '보통', '좋음', '매우 강함'][
            Math.min(s, 4)
          ];
          pwdLabel.textContent = '강도: ' + txt;
        });
        function scorePwd(p) {
          let s = 0;
          if (!p) return s;
          if (p.length >= 6) s++;
          if (/[A-Z]/.test(p)) s++;
          if (/[a-z]/.test(p)) s++;
          if (/\d/.test(p)) s++;
          if (/[^A-Za-z0-9]/.test(p)) s++;
          if (p.length >= 12) s++;
          return Math.min(s, 4);
        }

        /* 양.음.윤 구분 선택 시 윤달여부 체크박스 표시/숨김 */
        const calendarTypeSelect = document.getElementById('sMem_calendar_type');
        const leapMonthCtrl = document.getElementById('leapMonthCtrl');
        if (calendarTypeSelect && leapMonthCtrl) {
          function toggleLeapMonthCtrl() {
            const calendarType = calendarTypeSelect.value;
            if (calendarType === '음력' || calendarType === '윤달') {
              leapMonthCtrl.style.display = 'block';
            } else {
              leapMonthCtrl.style.display = 'none';
              const leapCheckbox = document.getElementById('is_leap_month');
              if (leapCheckbox) leapCheckbox.checked = false;
            }
          }
          calendarTypeSelect.addEventListener('change', toggleLeapMonthCtrl);
          // 초기 상태 설정
          toggleLeapMonthCtrl();
        }

        /* 검증 루틴 (원본 유지 + 5단계 서명 필수 추가) */
        function validate(step) {
          document
            .querySelectorAll('.error')
            .forEach((e) => (e.style.display = 'none'));
          let ok = true;

          (reqByStep[step] || []).forEach((id) => {
            if (id === 'sMem_gender') {
              if (!form.querySelector('input[name="sMem_gender"]:checked')) {
                showErr(id);
                ok = false;
              }
            } else {
              const el = document.getElementById(id);
              if (!el) return;
              if (el.type === 'checkbox' && !el.checked) {
                showErr(id);
                ok = false;
              } else if (!el.value) {
                if (id === 'signature_canvas_data') {
                  alert('서명을 완료해 주세요.');
                }
                showErr(id);
                ok = false;
              }
            }
          });

          if (step >= 5) {
            // 5단계: 서명 저장 필수 체크
            if (!isSignatureSaved) {
              alert('❌ 서명을 작성한 후 [서명 저장] 버튼을 클릭해 주세요.');
              document
                .getElementById('signSave')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              ok = false;
              return ok;
            }
          }

          if (step >= 3) {
            const mv = document.getElementById('sMem_mobile').value.trim();
            const mre = /^010-\d{4}-\d{4}$/;
            if (!mre.test(mv)) {
              showErr('sMem_mobile');
              ok = false;
            }
            const ev = email.value.trim();
            const ere = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!ere.test(ev)) {
              showErr('sMem_email');
              ok = false;
            }
          }

          if (step >= 2) {
            // 아이디 중복 확인 필수 체크 (수정 모드가 아닌 경우만)
            const memberId = getMemberIdFromUrl();
            if (!memberId && !isIdChecked) {
              alert('❌ 아이디 중복 확인을 먼저 진행해 주세요.');
              document
                .getElementById('idCheckBtn')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              ok = false;
              return ok;
            }

            const p1 = pwd.value;
            const p2 = pwd2.value;
            if (p1.length < 6) {
              showErr('sMem_pwdHash');
              ok = false;
            }
            if (p1 !== p2) {
              showErr('pwd2');
              ok = false;
            }
          }

          return ok;
        }
        function showErr(name) {
          const e = document.querySelector(`.error[data-err="${name}"]`);
          if (e) e.style.display = 'block';
        }

        /* 수집 & 요약 (요약에 서명 데이터/미리보기 포함) */
        function collect() {
          const names = [
            'sMem_id',
            'sMem_pwdHash',
            'sMem_name',
            'sMem_nickname',
            'sMem_birthdt',
            'sMem_birth_year',
            'sMem_calendar_type',
            'is_leap_month',
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
            'reference',
            'signature_canvas_data' /* (신규) 캔버스 서명 데이터 */,
          ];
          const data = {};
          names.forEach((n) => {
            const el = form.elements[n];
            if (!el) return;
            // 체크박스 처리
            if (el.type === 'checkbox') {
              // is_leap_month는 boolean으로 저장 (smem_yundal)
              if (n === 'is_leap_month') {
                data[n] = el.checked ? true : false;
              } else {
                data[n] = el.checked ? 1 : 0;
              }
            } else if (el.type === 'number') {
              data[n] = el.value === '' ? null : +el.value;
            } else {
              data[n] = el.value || null;
            }
          });
          data['sMem_gender'] =
            form.querySelector('input[name="sMem_gender"]:checked')?.value ??
            null;
          data['sMem_agreement'] =
            !!document.getElementById('agree_terms')?.checked &&
            !!document.getElementById('agree_privacy')?.checked
              ? 1
              : 0;
          data['sMem_agree'] = !!document.getElementById('sMem_agree')?.checked
            ? 1
            : 0;
          // 서명 파일 처리: 업로드된 경로가 있으면 우선 사용, 없으면 파일명 사용
          if (window.uploadedSignaturePath) {
            // 업로드 완료된 경로가 있으면 사용
            data['signature_file'] = window.uploadedSignaturePath;
            console.log('📁 collect()에서 업로드된 서명 파일 경로 사용:', window.uploadedSignaturePath);
          } else {
            // 업로드되지 않았으면 파일 입력에서 파일명 가져오기
            const f = document.getElementById('signature_file')?.files?.[0];
            data['signature_file'] = f ? f.name : null;
          }
          
          data['sMem_status'] = 'OPEN';

          // (가독성) 캔버스 서명 존재 여부 플래그
          data['signature_drawn'] = !!(
            data['signature_canvas_data'] &&
            data['signature_canvas_data'].startsWith('data:image')
          );
          return data;
        }
        function renderSummary() {
          const data = collect();
          const box = document.getElementById('summary');
          box.innerHTML = '';
          
          // 디버깅: 수집된 데이터 확인
          console.log('📋 renderSummary - 수집된 데이터:', data);
          console.log('📋 renderSummary - signature_file 값:', data.signature_file);
          console.log('📋 renderSummary - window.uploadedSignaturePath:', window.uploadedSignaturePath);
          
          // signature_file을 data에 확실히 포함 (window.uploadedSignaturePath 우선)
          if (window.uploadedSignaturePath) {
            data.signature_file = window.uploadedSignaturePath;
            console.log('📁 renderSummary - window.uploadedSignaturePath를 data.signature_file에 설정:', data.signature_file);
          } else if (!data.signature_file) {
            // 업로드된 경로도 없고 data에도 없으면 파일 입력에서 확인
            const f = document.getElementById('signature_file')?.files?.[0];
            if (f) {
              data.signature_file = f.name;
              console.log('📁 renderSummary - 파일 입력에서 파일명 가져옴:', data.signature_file);
            } else {
              console.log('⚠️ renderSummary - 서명 파일 없음');
            }
          }

          // 필드명 한글 매핑
          const fieldLabels = {
            sMem_id: '멤버 ID',
            sMem_pwdHash: '비밀번호',
            sMem_name: '멤버 이름',
            sMem_nickname: '닉네임',
            sMem_birthdt: '생년월일',
            sMem_birth_year: '태어난 연도',
            sMem_calendar_type: '양력/음력 구분',
            is_leap_month: '윤달 여부',
            sMem_gender: '성별',
            sMem_buss_name: '자영업자 상호',
            sMem_comp_name: '회사명',
            sMem_phone: '전화번호',
            sMem_mobile: '휴대폰',
            sMem_email: '이메일',
            zipcode: '우편번호',
            address1: '기본주소',
            address2: '상세주소',
            zipcode_s: '별도 우편번호',
            address1_s: '별도 기본주소',
            address2_s: '별도 상세주소',
            sMem_snsgu: '고객 구분',
            sMem_choice1: 'Color 선택1',
            sMem_choice2: 'Color 선택2',
            sMem_choice3: 'Color 선택3',
            sMem_choice4: 'Color 선택4',
            sMem_choice5: '동물 선택1',
            sMem_choice6: '동물 선택2',
            sMem_choice7: '동물 선택3',
            sMem_choice8: '동물 선택4',
            sMem_choice9: '인형 선택1',
            sMem_choice10: '인형 선택2',
            sMem_choice11: '인형 선택3',
            sMem_choice12: '인형 선택4',
            sMem_quest: '상담 질문사항',
            sMem_content_enc: '상담 문의내용',
            old_name: '개명 전 이름',
            new_name: '개명 후 이름',
            sMemfam_id: '추천인 ID',
            recommender: '추천인 성명',
            applicant: '신청인',
            signature_file: '서명 파일',
            reference: '상담답변/참고사항',
            sMem_agreement: '이용약관/개인정보 동의',
            sMem_agree: '마케팅 동의',
            sMem_admin_id: '담당 관리자 ID',
            sMem_grade: '멤버 평가등급',
            sMem_status: '상태',
            agree_terms: '이용약관 동의',
            agree_privacy: '개인정보 동의',
            pwd2: '비밀번호 확인',
            signature_canvas_data: '서명 이미지',
          };

          // signature_file을 가장 먼저 표시 (항상 보이도록 강조)
          // window.uploadedSignaturePath가 최우선, 그 다음 data.signature_file
          const signaturePath = window.uploadedSignaturePath || data.signature_file || null;
          
          console.log('🔍 renderSummary - signature_file 처리:', {
            'data.signature_file': data.signature_file,
            'window.uploadedSignaturePath': window.uploadedSignaturePath,
            '최종 signaturePath': signaturePath,
            'signaturePath 타입': typeof signaturePath,
            'signaturePath 값': String(signaturePath)
          });
          
          const signatureItem = document.createElement('div');
          signatureItem.className = 'item';
          signatureItem.style.border = '2px solid #10b981';
          signatureItem.style.borderRadius = '10px';
          signatureItem.style.padding = '14px';
          signatureItem.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
          signatureItem.style.marginBottom = '12px';
          signatureItem.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.15)';
          
          const signatureLabel = '서명 파일';
          let signatureDisplayValue = '';
          
          // signaturePath 유효성 검사: null, undefined, 빈 문자열, 'null', 'undefined' 문자열 제외
          const isValidPath = signaturePath && 
                              signaturePath !== null && 
                              signaturePath !== undefined &&
                              signaturePath !== '' && 
                              String(signaturePath).trim() !== '' &&
                              String(signaturePath).toLowerCase() !== 'null' && 
                              String(signaturePath).toLowerCase() !== 'undefined';
          
          console.log('🔍 renderSummary - signaturePath 유효성 검사:', {
            'signaturePath': signaturePath,
            'isValidPath': isValidPath,
            '타입': typeof signaturePath
          });
          
          if (isValidPath) {
            // 경로인 경우 (uploads/로 시작하거나 /uploads/로 시작)
            if (signaturePath.startsWith('uploads/') || signaturePath.startsWith('/uploads/')) {
              signatureDisplayValue = `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                  <span style="color:#10b981;font-weight:700;font-size:16px;">✅</span>
                  <span style="color:#10b981;font-weight:700;font-size:14px;word-break:break-all;flex:1;">${String(signaturePath).replace(/</g, '&lt;')}</span>
                </div>
                <div style="font-size:12px;color:#6b7280;padding-left:26px;">서명 파일이 업로드되었습니다</div>
              `;
            } else {
              // 파일명인 경우 (아직 업로드 전)
              signatureDisplayValue = `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                  <span style="color:#f59e0b;font-weight:700;font-size:16px;">⚠️</span>
                  <span style="color:#f59e0b;font-weight:600;font-size:14px;word-break:break-all;flex:1;">${String(signaturePath).replace(/</g, '&lt;')}</span>
                </div>
                <div style="font-size:12px;color:#6b7280;padding-left:26px;">파일명 (업로드 대기 중)</div>
              `;
            }
          } else {
            // 서명 파일이 없는 경우
            signatureDisplayValue = `
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="color:#9ca3af;font-size:16px;">📄</span>
                <span style="color:#9ca3af;font-style:italic;font-size:13px;">서명 파일이 없습니다</span>
              </div>
            `;
          }
          
          signatureItem.innerHTML = `
            <div style="color:#374151;font-weight:800;margin-bottom:8px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">${signatureLabel}</div>
            <div>${signatureDisplayValue}</div>
          `;
          
          // 가장 먼저 추가 (다른 필드들보다 위에 표시)
          box.insertBefore(signatureItem, box.firstChild);
          
          // 기본 필드
          Object.entries(data).forEach(([k, v]) => {
            if (k === 'signature_canvas_data') return; // 미리보기 별도 처리
            if (k === 'signature_file') return; // 이미 위에서 처리했으므로 건너뛰기
            
            // is_leap_month는 boolean 값을 한글로 표시
            if (k === 'is_leap_month') {
              const r = document.createElement('div');
              r.className = 'item';
              const label = fieldLabels[k] || k;
              const displayValue = v === true || v === 1 || v === '1' || v === 'true' ? '예' : '아니오';
              r.innerHTML = `<div style="color:var(--ink-sub)">${label}</div><div>${displayValue}</div>`;
              box.appendChild(r);
              return;
            }
            
            const r = document.createElement('div');
            r.className = 'item';
            const safe =
              v === null || v === undefined || v === ''
                ? '<span style="opacity:.6">-</span>'
                : String(v).replace(/</g, '&lt;');
            const label = fieldLabels[k] || k; // 한글 레이블 또는 원본 키
            r.innerHTML = `<div style="color:var(--ink-sub)">${label}</div><div>${safe}</div>`;
            box.appendChild(r);
          });

          // 서명 이미지 미리보기
          const sig = form.elements['signature_canvas_data']?.value || null;
          const row = document.createElement('div');
          row.className = 'item';
          row.innerHTML = `<div style="color:var(--ink-sub)">서명 이미지</div><div>${
            sig
              ? `<img style="max-width:180px;max-height:160px;border:1px solid var(--line);border-radius:10px" src="${sig}">`
              : '<span style="opacity:.6">-</span>'
          }</div>`;
          box.appendChild(row);
        }

        function saveDraft() {
          localStorage.setItem('sMembersDraft', JSON.stringify(collect()));
        }
        (function restore() {
          const raw = localStorage.getItem('sMembersDraft');
          if (!raw) return;
          try {
            const d = JSON.parse(raw);
            for (const [k, v] of Object.entries(d)) {
              const el = form.elements[k];
              if (!el) continue;
              if (el.type === 'checkbox') {
                el.checked = !!v;
              } else if (el.type === 'radio') {
                const r = form.querySelector(
                  `input[name="${k}"][value="${v}"]`
                );
                if (r) r.checked = true;
              } else {
                el.value = v ?? '';
              }
            }
            // 서명 미리보기 복원
            if (d['signature_canvas_data']) {
              const box = document.getElementById('signPreviewBox');
              box.innerHTML = '';
              const img = new Image();
              img.src = d['signature_canvas_data'];
              img.style.maxWidth = '100%';
              img.style.maxHeight = '100%';
              box.appendChild(img);
            }
          } catch {}
        })();

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!validate(6)) return;

          const payload = collect();
          const memberId = getMemberIdFromUrl();

          // 기본값 설정: family_gu='01', adviser_role='A'
          if (!payload.family_gu) {
            payload.family_gu = '01';
          }
          if (!payload.adviser_role) {
            payload.adviser_role = 'A';
          }

          // 1. 필수 항목 검증: sMem_id, sMem_name
          if (!payload.sMem_id || !payload.sMem_id.trim()) {
            alert('❌ 회원 ID는 필수 항목입니다.');
            show(2); // 2단계로 이동
            document.getElementById('sMem_id')?.focus();
            return;
          }
          if (!payload.sMem_name || !payload.sMem_name.trim()) {
            alert('❌ 회원 이름은 필수 항목입니다.');
            show(2); // 2단계로 이동
            document.getElementById('sMem_name')?.focus();
            return;
          }

          // 2. 서명 이미지 업로드 처리 (이미 업로드된 경우 재업로드하지 않음)
          let signatureFilePath = window.uploadedSignaturePath || null;
          
          // 업로드되지 않았으면 서명 파일 입력 필드 확인
          if (!signatureFilePath) {
            const signatureFileInput = document.getElementById('signature_file');
            if (signatureFileInput && signatureFileInput.files && signatureFileInput.files[0]) {
              try {
                console.log('📤 제출 전 서명 파일 업로드 시작 (파일 입력)...');
                
                const formData = new FormData();
                const fileName = `${payload.sMem_id}_${payload.sMem_name}.png`;
                formData.append('file', signatureFileInput.files[0], fileName);

                // Mixed Content 오류 방지: 안전한 프로토콜 사용
                const uploadUrl = getApiUrl('/secret/api/v1/files/upload-signature');
                const uploadResponse = await fetch(uploadUrl, {
                  method: 'POST',
                  body: formData,
                  mode: 'cors',
                  credentials: 'same-origin',
                });

                if (!uploadResponse.ok) {
                  const errorText = await uploadResponse.text();
                  console.error('❌ 서명 파일 업로드 실패:', uploadResponse.status, errorText);
                } else {
                  const uploadResult = await uploadResponse.json();
                  if (uploadResult.ok && uploadResult.path) {
                    signatureFilePath = uploadResult.path;
                    window.uploadedSignaturePath = signatureFilePath;
                    console.log('✅ 서명 파일 업로드 성공:', signatureFilePath);
                  }
                }
              } catch (error) {
                console.error('서명 파일 업로드 오류:', error);
              }
            }
          }
          
          // 업로드되지 않았고 서명 캔버스 데이터가 있으면 업로드
          if (
            !signatureFilePath &&
            payload.signature_canvas_data &&
            payload.signature_canvas_data.startsWith('data:image')
          ) {
            try {
              console.log('📤 제출 전 서명 파일 업로드 시작...');
              
              // Base64 이미지를 Blob으로 변환
              const response = await fetch(payload.signature_canvas_data);
              const blob = await response.blob();

              // FormData 생성
              const formData = new FormData();
              const fileName = `${payload.sMem_id}_${payload.sMem_name}.png`;
              formData.append('file', blob, fileName);

              // 서명 이미지 업로드
              // Mixed Content 오류 방지: 안전한 프로토콜 사용
              const uploadUrl = getApiUrl('/secret/api/v1/files/upload-signature');
              const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'same-origin',
              });

              // 응답 상태 확인
              if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('❌ 서명 이미지 업로드 실패:', uploadResponse.status, errorText);
                throw new Error(`서명 이미지 업로드 실패: ${uploadResponse.status}`);
              }

              const uploadResult = await uploadResponse.json();

              if (uploadResult.ok && uploadResult.path) {
                signatureFilePath = uploadResult.path;
                window.uploadedSignaturePath = signatureFilePath;
                console.log('✅ 서명 이미지 업로드 성공:', signatureFilePath);
              } else {
                console.warn('⚠️ 서명 이미지 업로드 실패:', uploadResult.error);
              }
            } catch (error) {
              console.error('서명 이미지 업로드 오류:', error);
            }
          }

          // 3. 서명파일 경로를 payload에 확실히 추가
          if (signatureFilePath) {
            payload.signature_file = signatureFilePath;
            console.log('📁 서명 파일 경로 추가:', signatureFilePath);
          } else if (window.uploadedSignaturePath) {
            // window.uploadedSignaturePath가 있으면 사용
            payload.signature_file = window.uploadedSignaturePath;
            console.log('📁 window.uploadedSignaturePath를 payload에 추가:', window.uploadedSignaturePath);
          } else {
            // collect()에서 수집된 값이 있으면 사용
            if (payload.signature_file) {
              console.log('📁 collect()에서 수집된 signature_file 사용:', payload.signature_file);
            } else {
              console.log('⚠️ 서명 파일 경로 없음');
            }
          }
          
          // 4. is_leap_month를 boolean으로 확실히 변환
          // collect()에서 이미 boolean으로 변환되었지만, 확실히 하기 위해 다시 확인
          const originalIsLeapMonth = payload.is_leap_month;
          if (originalIsLeapMonth !== undefined && originalIsLeapMonth !== null) {
            // 이미 boolean이면 그대로 사용
            if (typeof originalIsLeapMonth === 'boolean') {
              payload.is_leap_month = originalIsLeapMonth;
              console.log('🔍 is_leap_month: 이미 boolean 타입, 그대로 사용:', payload.is_leap_month);
            } else {
              // 1, '1', true, 'true'는 true, 그 외는 false
              const isLeap = originalIsLeapMonth === 1 || 
                            originalIsLeapMonth === true || 
                            originalIsLeapMonth === '1' || 
                            String(originalIsLeapMonth).toLowerCase() === 'true';
              payload.is_leap_month = isLeap;
              console.log('🔍 is_leap_month 변환:', {
                '원본 값': originalIsLeapMonth,
                '원본 타입': typeof originalIsLeapMonth,
                '변환 후': isLeap,
                '변환 후 타입': typeof isLeap
              });
            }
          } else {
            // 값이 없으면 체크박스에서 직접 확인
            const leapCheckbox = document.getElementById('is_leap_month');
            if (leapCheckbox) {
              payload.is_leap_month = leapCheckbox.checked;
              console.log('🔍 is_leap_month 체크박스에서 직접 확인:', payload.is_leap_month, '(타입:', typeof payload.is_leap_month, ')');
            } else {
              payload.is_leap_month = false;
              console.log('🔍 is_leap_month 기본값 false 설정');
            }
          }

          // signature_canvas_data는 DB에 저장하지 않음 (제거)
          delete payload.signature_canvas_data;
          delete payload.signature_drawn;
          
          // 디버깅: 최종 payload 확인
          console.log('📤 최종 전송될 payload:', {
            'signature_file': payload.signature_file,
            'is_leap_month': payload.is_leap_month,
            'is_leap_month 타입': typeof payload.is_leap_month,
            '전체 payload 키': Object.keys(payload)
          });

          // 4. PostgreSQL DB에 회원 정보 저장 또는 수정
          try {
            let response;
            // Mixed Content 오류 방지: 안전한 프로토콜 사용
            const apiBase = getApiUrl('/secret/api/v1/smembers');
            
            console.log('🔗 API 요청 URL:', apiBase);
            console.log('🔒 사용 프로토콜:', getSecureProtocol());
            console.log('🌐 호스트:', window.location.host);
            
            if (memberId) {
              // 수정 모드
              response = await fetch(`${apiBase}/${memberId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                mode: 'cors',
                credentials: 'same-origin',
              });
            } else {
              // 생성 모드
              response = await fetch(apiBase, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                mode: 'cors',
                credentials: 'same-origin',
              });
            }

            const result = await response.json();

            if (result.ok) {
              alert(
                memberId
                  ? '✅ 회원정보가 수정되었습니다!'
                  : '✅ 회원가입이 완료되었습니다!'
              );
              // 성공 시 폼 초기화 및 첫 단계로 이동
              form.reset();
              localStorage.removeItem('sMembersDraft');
              localStorage.removeItem('signatureSaved');
              isSignatureSaved = false;

              // 서명 캔버스와 미리보기 초기화
              const signPad = document.getElementById('signPad');
              const signPreview = document.getElementById('signPreviewBox');
              const signHidden = document.getElementById(
                'signature_canvas_data'
              );
              const signStatus = document.getElementById('signStatus');

              if (signPad) {
                const ctx = signPad.getContext('2d');
                ctx.clearRect(0, 0, signPad.width, signPad.height);
              }
              if (signPreview) {
                signPreview.innerHTML =
                  '<span style="color:var(--ink-sub)">서명 미리보기</span>';
              }
              if (signHidden) {
                signHidden.value = '';
              }
              if (signStatus) {
                signStatus.textContent = '';
              }

              show(1);
            } else {
              alert(
                `❌ ${memberId ? '회원정보 수정' : '회원가입'} 실패: ${
                  result.error || '알 수 없는 오류'
                }`
              );
            }
          } catch (error) {
            console.error('오류:', error);
            alert('❌ 서버 연결 오류가 발생했습니다.');
          }
        });

        // URL 파라미터에서 회원 ID 가져오기
        function getMemberIdFromUrl() {
          const params = new URLSearchParams(window.location.search);
          return params.get('sm_id') || params.get('sM_id');
        }

        // 페이지 로드 시 회원 정보 불러오기 (수정 모드)
        async function loadMemberData() {
          const memberId = getMemberIdFromUrl();
          if (!memberId) return;

          try {
            // Mixed Content 오류 방지: 안전한 프로토콜 사용
            const loadUrl = getApiUrl(`/secret/api/v1/smembers/${memberId}`);
            const response = await fetch(loadUrl, {
              mode: 'cors',
              credentials: 'same-origin',
            });
            const result = await response.json();

            if (result.ok && result.data) {
              const data = result.data;

              // 폼 필드에 데이터 채우기
              for (const [key, value] of Object.entries(data)) {
                const el = form.elements[key];
                if (!el) continue;

                if (el.type === 'checkbox') {
                  el.checked = value === 1 || value === true || value === '1' || value === 'true';
                } else if (el.type === 'radio') {
                  const radio = form.querySelector(
                    `input[name="${key}"][value="${value}"]`
                  );
                  if (radio) radio.checked = true;
                } else {
                  el.value = value ?? '';
                }
              }
              
              // is_leap_month 값 설정 (소문자 키도 확인)
              const isLeapMonth = data.is_leap_month !== undefined ? data.is_leap_month : (data.is_leap_month !== undefined ? data.is_leap_month : 0);
              const leapCheckbox = document.getElementById('is_leap_month');
              if (leapCheckbox) {
                leapCheckbox.checked = isLeapMonth === 1 || isLeapMonth === true || isLeapMonth === '1' || isLeapMonth === 'true';
              }
              
              // calendar_type이 음력이면 체크박스 표시
              if (calendarTypeSelect && leapMonthCtrl) {
                const calendarType = data.sMem_calendar_type || data.smem_calendar_type || '양력';
                if (calendarType === '음력' || calendarType === '윤달') {
                  leapMonthCtrl.style.display = 'block';
                }
              }

              // 수정 모드에서는 아이디 중복확인을 이미 완료된 것으로 처리
              if (data.smem_id) {
                isIdChecked = true;
                lastCheckedId = data.smem_id;
              }

              // 수정 모드에서 서명 데이터가 있으면 서명 저장 완료로 처리
              if (
                data.signature_file ||
                form.elements['signature_canvas_data']?.value
              ) {
                isSignatureSaved = true;
              }

              // 제목 및 버튼 텍스트 변경
              document.querySelector('h1').textContent = '회원정보 수정';
              document.getElementById('submitBtn').textContent = '수정';
              document.getElementById('submitHint').innerHTML =
                '아래 정보를 확인하고 <strong>수정</strong> 버튼을 클릭하세요.';

              // 삭제 버튼 표시
              const deleteBtn = document.getElementById('deleteBtn');
              deleteBtn.style.display = 'inline-block';

              console.log('✅ 회원 데이터 로드 완료:', data);
            } else {
              alert('❌ 회원 정보를 불러올 수 없습니다.');
            }
          } catch (error) {
            console.error('회원 데이터 로드 오류:', error);
            alert('❌ 회원 정보 로드 중 오류가 발생했습니다.');
          }
        }

        // 회원 삭제 기능
        async function deleteMember() {
          const memberId = getMemberIdFromUrl();
          if (!memberId) {
            alert('❌ 삭제할 회원 ID가 없습니다.');
            return;
          }

          if (
            !confirm(
              '⚠️ 정말로 이 회원 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
            )
          ) {
            return;
          }

          try {
            // Mixed Content 오류 방지: 안전한 프로토콜 사용
            const deleteUrl = getApiUrl(`/secret/api/v1/smembers/${memberId}`);
            const response = await fetch(deleteUrl, {
              method: 'DELETE',
              mode: 'cors',
              credentials: 'same-origin',
            });

            const result = await response.json();

            if (result.ok) {
              alert('✅ 회원 정보가 삭제되었습니다.');
              // 삭제 후 폼 초기화 및 URL 파라미터 제거
              window.location.href = window.location.pathname;
            } else {
              alert(`❌ 삭제 실패: ${result.error || '알 수 없는 오류'}`);
            }
          } catch (error) {
            console.error('삭제 오류:', error);
            alert('❌ 서버 연결 오류가 발생했습니다.');
          }
        }

        // 삭제 버튼 이벤트 리스너
        document
          .getElementById('deleteBtn')
          .addEventListener('click', deleteMember);

        // 페이지 로드 시 실행
        loadMemberData();

        setProgress();
        show(1);

        /* ====== UX 플러스: 엔터/단축키/해시/포커스 (원본 유지) ====== */
        (function () {
          const nextBtn = () =>
            document.querySelector('[data-step]:not([hidden]) [data-next]');
          const prevBtn = () =>
            document.querySelector('[data-step]:not([hidden]) [data-prev]');
          function getCurStep() {
            const curSec = [...document.querySelectorAll('[data-step]')].find(
              (s) => !s.hasAttribute('hidden')
            );
            return curSec ? +curSec.dataset.step : 1;
          }
          function getTotal() {
            return document.querySelectorAll('[data-step]').length;
          }
          function goNext() {
            nextBtn()?.click();
          }
          function goPrev() {
            prevBtn()?.click();
          }

          // 엔터 → 다음(마지막이면 제출)
          const form = document.getElementById('form');
          form.addEventListener('keydown', (e) => {
            const tag = (e.target.tagName || '').toLowerCase();
            if (
              e.key !== 'Enter' ||
              tag === 'textarea' ||
              tag === 'button' ||
              tag === 'a'
            )
              return;
            e.preventDefault();
            const cur = getCurStep();
            const total = getTotal();
            if (cur < total) goNext();
            else form.requestSubmit();
          });

          // Alt+→/←, Ctrl(or ⌘)+Enter
          window.addEventListener('keydown', (e) => {
            const cur = getCurStep();
            const total = getTotal();
            if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                goNext();
              }
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goPrev();
              }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              if (cur < total) goNext();
              else form.requestSubmit();
            }
          });

          // 포커스 첫 입력
          const focusFirstInput = () => {
            const curSec = document.querySelector('[data-step]:not([hidden])');
            const first = curSec?.querySelector(
              'input, select, textarea, button'
            );
            first && first.focus({ preventScroll: true });
          };
          const mo = new MutationObserver(() => focusFirstInput());
          document
            .querySelectorAll('[data-step]')
            .forEach((sec) =>
              mo.observe(sec, { attributes: true, attributeFilter: ['hidden'] })
            );
          window.addEventListener('load', focusFirstInput);

          // 해시 동기화
          function setHashForStep(step) {
            const want = `#step-${step}`;
            if (location.hash !== want) history.replaceState(null, '', want);
          }
          document.addEventListener('click', (e) => {
            if (!e.target.closest('[data-next],[data-prev]')) return;
            requestAnimationFrame(() => setHashForStep(getCurStep()));
          });
          function stepFromHash() {
            const m = (location.hash || '').match(/^#step-(\d+)$/);
            return m ? Math.max(1, Math.min(getTotal(), +m[1])) : null;
          }
          window.addEventListener('hashchange', () => {
            const goal = stepFromHash();
            if (!goal) return;
            const cur = getCurStep();
            if (goal === cur) return;
            const dir = goal > cur ? 1 : -1;
            const move = () => {
              const now = getCurStep();
              if (now === goal) {
                focusFirstInput();
                return;
              }
              if (dir > 0) goNext();
              else goPrev();
              requestAnimationFrame(move);
            };
            move();
          });
          window.addEventListener('load', () => {
            const goal = stepFromHash();
            if (goal && goal !== getCurStep()) {
              const dir = goal > getCurStep() ? 1 : -1;
              const move = () => {
                const now = getCurStep();
                if (now === goal) {
                  focusFirstInput();
                  return;
                }
                if (dir > 0) goNext();
                else goPrev();
                requestAnimationFrame(move);
              };
              move();
            } else {
              setHashForStep(getCurStep());
            }
          });
        })();

        /* ====== (신규) 캔버스 서명 패드 (색/굵기 옵션 포함) ====== */
        // 서명 저장 상태 추적 변수 (전역)
        let isSignatureSaved = false;

        (function setupSignPad() {
          const pad = document.getElementById('signPad');
          if (!pad) return;
          const status = document.getElementById('signStatus');
          const clearBtn = document.getElementById('signClear');
          const saveBtn = document.getElementById('signSave');
          const hidden = document.getElementById('signature_canvas_data');
          const preview = document.getElementById('signPreviewBox');
          const penColor = document.getElementById('penColor');
          const penWidth = document.getElementById('penWidth');

          // HiDPI 대응
          function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const cssW = pad.clientWidth || 640;
            const cssH = pad.clientHeight || 220;
            pad.width = Math.floor(cssW * ratio);
            pad.height = Math.floor(cssH * ratio);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform before scaling
            ctx.scale(ratio, ratio);
            redraw();
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
          function redraw() {
            // 현재는 실시간 스트로크만 사용 (전체 리렌더 필요 없음)
          }

          function start(e) {
            drawing = true;
            points = [];
            points.push(posFromEvent(e));
            // 서명을 새로 그리기 시작하면 저장 상태 초기화
            isSignatureSaved = false;
            localStorage.setItem('signatureSaved', 'false');
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
          // 초기 캔버스 크기 세팅
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
              img.style.maxHeight = '100%';
              preview.appendChild(img);
            } else {
              preview.innerHTML =
                '<span style="color:var(--ink-sub)">서명 미리보기</span>';
            }
          }

          clearBtn?.addEventListener('click', () => {
            const cssW = pad.clientWidth || 640;
            const cssH = pad.clientHeight || 220;
            ctx.clearRect(0, 0, pad.width, pad.height);
            resizeCanvas();
            hidden.value = '';
            setPreview('');
            setStatus('서명이 초기화되었습니다.');
            // 서명 초기화 시 저장 상태도 초기화
            isSignatureSaved = false;
            localStorage.setItem('signatureSaved', 'false');
          });

          saveBtn?.addEventListener('click', () => {
            try {
              const dataUrl = pad.toDataURL('image/png');
              // 간단한 비어있는 서명 방지: 데이터 URL 길이 체크
              if (!dataUrl || dataUrl.length < 5000) {
                alert('서명이 너무 짧거나 없습니다. 다시 서명해 주세요.');
                isSignatureSaved = false;
                localStorage.setItem('signatureSaved', 'false');
                return;
              }
              hidden.value = dataUrl;
              localStorage.setItem('sMembersDraft', JSON.stringify(collect())); // 드래프트 저장 업데이트
              setPreview(dataUrl);
              setStatus('서명이 저장되었습니다.');
              // 서명 저장 성공 시 상태 업데이트
              isSignatureSaved = true;
              localStorage.setItem('signatureSaved', 'true');
            } catch (err) {
              console.error(err);
              setStatus('서명 저장 중 오류가 발생했습니다.');
              isSignatureSaved = false;
              localStorage.setItem('signatureSaved', 'false');
            }
          });

          // 색/굵기 옵션 즉시 반영
          penColor?.addEventListener('input', (e) => {
            ctx.strokeStyle = e.target.value;
          });
          penWidth?.addEventListener('input', (e) => {
            ctx.lineWidth = parseFloat(e.target.value || '2.5');
          });

          // 복원: 기존 드래프트에 서명 데이터 있으면 미리보기 표시
          const raw = localStorage.getItem('sMembersDraft');
          if (raw) {
            try {
              const d = JSON.parse(raw);
              if (d['signature_canvas_data']) {
                hidden.value = d['signature_canvas_data'];
                setPreview(d['signature_canvas_data']);
                // 드래프트 복원 시에는 저장 상태를 체크 (명시적으로 저장한 경우만 true)
                const savedStatus = localStorage.getItem('signatureSaved');
                isSignatureSaved = savedStatus === 'true';
              }
            } catch {}
          }
        })();
      })();

      /* ====== 주소찾기: 우편번호/기본주소 자동채움 + 별도주소 동기화 (원본 유지) ====== */
      function openPostcode(zipId, addr1Id) {
        if (!window.daum || !daum.Postcode) {
          alert(
            '우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도하세요.'
          );
          return;
        }
        new daum.Postcode({
          oncomplete: function (data) {
            const $zip = document.getElementById(zipId);
            const $addr1 = document.getElementById(addr1Id);
            const isBase = zipId === 'zipcode';

            // 1) 우편번호
            if ($zip) $zip.value = data.zonecode || '';

            // 2) 주소(도로명/지번) + (법정동/건물명)
            const baseAddr =
              data.userSelectedType === 'R'
                ? data.roadAddress
                : data.jibunAddress;
            let extra = '';
            if (data.bname && /[동|로|가]$/g.test(data.bname))
              extra += data.bname;
            if (data.buildingName && data.apartment === 'Y')
              extra += (extra ? ', ' : '') + data.buildingName;
            const fullAddr = baseAddr + (extra ? ` (${extra})` : '');
            if ($addr1) $addr1.value = fullAddr;

            // 3) "기본 주소와 동일" 체크 시 별도주소 동기화
            const copy = document.getElementById('copyAddr');
            if (copy && copy.checked && isBase) {
              const z2 = document.getElementById('zipcode_s');
              const a2 = document.getElementById('address1_s');
              if (z2) z2.value = $zip ? $zip.value : '';
              if (a2) a2.value = $addr1 ? $addr1.value : '';
            }

            // 4) 상세주소 포커스
            const $detail = isBase
              ? document.getElementById('address2')
              : document.getElementById('address2_s');
            $detail && $detail.focus();
          },
        }).open();
      }

      /* 기본주소 수정 시에도 "동일" 체크면 별도주소가 따라가도록 동기화 (원본 유지) */
      (function setupAddressSync() {
        const copy = document.getElementById('copyAddr');
        const baseIds = ['zipcode', 'address1', 'address2'];
        const sync = () => {
          if (!copy || !copy.checked) return;
          const z = document.getElementById('zipcode');
          const a1 = document.getElementById('address1');
          const a2 = document.getElementById('address2');
          const z2 = document.getElementById('zipcode_s');
          const a1s = document.getElementById('address1_s');
          const a2s = document.getElementById('address2_s');
          if (z && z2) z2.value = z.value;
          if (a1 && a1s) a1s.value = a1.value;
          if (a2 && a2s) a2s.value = a2.value;
        };
        copy?.addEventListener('change', () => {
          const checked = copy.checked;
          ['zipcode_s', 'address1_s', 'address2_s'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.readOnly = checked;
          });
          sync();
        });
        baseIds.forEach((id) => {
          const el = document.getElementById(id);
          el?.addEventListener('input', sync);
        });
      })();
# capture — 공유 1탭 인입 PWA

**공개 Pages에 배포되는 분자(웹) 부품.** 폰 공유 시트에서 1탭으로 **내 계정의 `{prefix}-01-inbox`**(private)에 대화를 커밋한다.
소스코드는 이 공개 레포에서 배포하지만, **데이터는 고객의 private 인박스 레포에만** 남는다.

- 주소: `https://lfai-world.github.io/lfai-world/capture/`
- 저장 경로: `{owner}/{prefix}-01-inbox` → `logs/YYYY/MM/evt-YYYY-MM-DD-HHMMSS.md`
- 토큰: **fine-grained PAT**, `Contents: Read and write` 하나, **해당 인박스 레포 1개만**. 브라우저 IndexedDB에만 저장(zero-retention).

## 설치(폰)
1. Chrome에서 위 주소 열기 → 메뉴 → **홈 화면에 추가**
2. 앱 → 설정 → PAT 붙여넣고 **연결 테스트** (push=가능 확인)
3. ChatGPT 등에서 공유 → **LFAI Capture** 선택 → 확인 후 **저장**

## 동작
- 서비스워커가 `share_target` POST를 받아 캐시에 넣고 앱으로 리다이렉트한다.
- 오프라인이면 IndexedDB 큐에 넣고, 온라인 복귀 시 자동 재전송한다.
- 같은 초에 두 번 저장하면 파일명에 `-2`가 붙는다(덮어쓰지 않음).

## 변수화
`설정`에서 owner/prefix만 바꾸면 다른 계정에서도 그대로 동작한다(고객 양산).

const state = {
  areas: [],
  assets: [],
  missing: [],
  deliveryPreview: { includedFiles: [], excludedFileCount: 0, missing: [] },
  submissionCheckVisible: false,
};

const elements = {
  areaGrid: document.querySelector('#area-grid'),
  fileList: document.querySelector('#file-list'),
  lesson: document.querySelector('#lesson-select'),
  message: document.querySelector('#message'),
  validation: document.querySelector('#validation-result'),
  deliverySummary: document.querySelector('#delivery-summary'),
  deliveryFileList: document.querySelector('#delivery-file-list'),
  deliveryReview: document.querySelector('#delivery-review'),
  zipButton: document.querySelector('#zip-button'),
};

const showMessage = (message, error = false) => {
  elements.message.textContent = message;
  elements.message.classList.toggle('message--error', error);
};

const request = async (url, options) => {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.error || '요청을 처리하지 못했습니다.');
    error.payload = payload;
    throw error;
  }
  return payload;
};

const toBase64 = async (file) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
};

const registerFile = async (area, type, file) => {
  try {
    showMessage(`${file.name} 등록 중…`);
    await request('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson: Number(elements.lesson.value),
        area,
        type,
        originalName: file.name,
        contentBase64: await toBase64(file),
        mediaType: file.type,
      }),
    });
    showMessage(`${file.name} 등록 완료`);
    await loadStatus();
  } catch (error) {
    showMessage(error.message, true);
  }
};

const createAreaCard = (area) => {
  const card = document.createElement('article');
  card.className = 'area-card';
  const currentLesson = Number(elements.lesson.value);
  const lessonTypes = area.types.filter((type) => type.lessons.includes(currentLesson));
  const typeOptions = lessonTypes
    .map((type) => `<option value="${type.key}">${type.label}</option>`)
    .join('');
  card.innerHTML = `
    <header><span>${String(state.areas.indexOf(area) + 1).padStart(2, '0')}</span><h3>${area.label}</h3></header>
    ${lessonTypes.length > 0 ? `
      <label>자료 유형<select>${typeOptions}</select></label>
      <div class="drop-zone" tabindex="0" role="button" aria-label="${area.label} 파일 선택">
        <strong>파일을 놓거나 선택</strong>
        <span>원본은 별도로 안전하게 보관됩니다.</span>
        <input type="file" multiple hidden />
      </div>
    ` : '<p class="area-card__empty">현재 등록한 자료는 아래에서 ZIP으로 묶을 수 있습니다.</p>'}
  `;

  const dropZone = card.querySelector('.drop-zone');
  if (dropZone) {
    const input = card.querySelector('input');
    const select = card.querySelector('select');
    const handleFiles = async (files) => {
      for (const file of files) await registerFile(area.key, select.value, file);
    };
    dropZone.addEventListener('click', () => input.click());
    dropZone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        input.click();
      }
    });
    dropZone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropZone.classList.add('drop-zone--active');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--active'));
    dropZone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropZone.classList.remove('drop-zone--active');
      handleFiles(event.dataTransfer.files);
    });
    input.addEventListener('change', () => handleFiles(input.files));
  }
  return card;
};

const renderAreas = () => {
  elements.areaGrid.replaceChildren(...state.areas.map(createAreaCard));
};

const renderFiles = () => {
  elements.fileList.innerHTML = state.assets.length
    ? state.assets.map((asset) => `
      <tr>
        <td>L${String(asset.lesson).padStart(2, '0')}</td>
        <td>${state.areas.find((area) => area.key === asset.area)?.label || asset.area}</td>
        <td>${asset.typeLabel}</td>
        <td><a href="/api/download?path=${encodeURIComponent(asset.relativePath)}">${asset.fileName}</a></td>
        <td>v${String(asset.version).padStart(2, '0')}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="5">등록된 파일이 없습니다.</td></tr>';
};

const renderMissing = () => {
  if (!state.submissionCheckVisible) {
    elements.validation.innerHTML = '<strong>자료는 일부만 등록해도 확인할 수 있습니다.</strong><p>현재 자료로 ZIP을 만들 수 있으며, 모든 결과물이 준비된 뒤에만 제출 전 확인을 사용합니다.</p>';
    return;
  }
  elements.validation.innerHTML = state.missing.length
    ? `<strong>아직 등록하지 않은 자료 ${state.missing.length}개</strong><p>현재 등록 자료 확인과 ZIP 생성은 가능합니다. 최종 제출 전에 아래 항목을 확인하세요.</p><ul>${state.missing.map((item) => `<li>${item.label}</li>`).join('')}</ul>`
    : '<strong>제출 항목이 모두 등록되었습니다.</strong><p>이 확인은 파일 존재 여부만 살피며 설계 품질이나 적합성을 판정하지 않습니다.</p>';
};

const renderDeliveryPreview = () => {
  const preview = state.deliveryPreview;
  elements.deliverySummary.textContent = [
    `등록 파일 ${preview.includedFiles.length}개가 포함됩니다.`,
    `작업 폴더의 미등록 파일 ${preview.excludedFileCount}개는 제외됩니다.`,
    `아직 필요한 항목 ${preview.missing.length}개를 확인하세요.`,
  ].join(' ');
  elements.deliveryFileList.replaceChildren(
    ...preview.includedFiles.map((file) => {
      const item = document.createElement('li');
      item.textContent = `${file.typeLabel} · ${file.fileName}`;
      return item;
    }),
  );
  if (preview.includedFiles.length === 0) {
    const item = document.createElement('li');
    item.textContent = '아직 등록된 파일이 없습니다.';
    elements.deliveryFileList.append(item);
  }
  elements.deliveryReview.checked = false;
  elements.zipButton.disabled = true;
};

async function loadStatus() {
  const payload = await request('/api/status');
  Object.assign(state, payload);
  renderAreas();
  renderFiles();
  renderMissing();
  renderDeliveryPreview();
}

document.querySelector('#refresh-button').addEventListener('click', loadStatus);
elements.lesson.addEventListener('change', renderAreas);
document.querySelector('#missing-button').addEventListener('click', async () => {
  state.submissionCheckVisible = true;
  await loadStatus();
  elements.validation.focus();
  showMessage('제출 전 확인을 완료했습니다.');
});
elements.deliveryReview.addEventListener('change', () => {
  elements.zipButton.disabled = !elements.deliveryReview.checked;
});
elements.zipButton.addEventListener('click', async () => {
  try {
    if (!elements.deliveryReview.checked) {
      showMessage('ZIP 포함 목록과 누락 항목을 먼저 확인하세요.', true);
      return;
    }
    const { asset, missing, excludedFileCount } = await request('/api/delivery', { method: 'POST' });
    showMessage(
      missing.length
        ? `${asset.fileName} 생성 완료 · 누락 ${missing.length}개 · 미등록 파일 ${excludedFileCount}개 제외`
        : `${asset.fileName} 생성 완료 · 미등록 파일 ${excludedFileCount}개 제외`,
    );
    await loadStatus();
  } catch (error) {
    showMessage(error.message, true);
  }
});
loadStatus().catch((error) => showMessage(error.message, true));

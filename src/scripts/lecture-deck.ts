type SlideRecord = {
  id: string;
  sectionId: string;
  sectionLabel: string;
  title: string;
  node: HTMLElement;
};

type SerializedSlideRecord = Omit<SlideRecord, 'node'> & {
  slideIndex: number;
  html: string;
};

type SlideManifest = {
  schemaVersion: 1;
  buildId: string;
  deckId: string;
  contentId: string;
  referenceViewport: { width: 1280; height: 720 };
  slides: SerializedSlideRecord[];
};

type OverrideRecord = {
  lessonId: string;
  slideId: string;
  editKey: string;
  originalText: string;
  replacementText: string;
  updatedAt: string;
};

type StoredOverrides = Record<string, OverrideRecord>;

const overrideStorageKey = 'ai-architecture-slide-overrides-v1';
const slideStorageKey = 'ai-architecture-slide-position-v1';
const channelName = 'ai-architecture-presenter';
const blockSelector = ':scope > h2, :scope > h3, :scope > h4, :scope > header, :scope > p, :scope > ul, :scope > ol, :scope > dl, :scope > table, :scope > figure, :scope > article, :scope > section, :scope > aside, :scope > details, :scope > pre, :scope > blockquote, :scope > div';
const excludedSelector = [
  '.section-heading',
  '.instructor-note',
  '.lesson-resource-downloads',
  '.lesson-assets',
  '.asset-policy',
  '.review-state',
  '.download-panel',
  '[data-presentation-exclude]',
  'button',
  'input',
  'textarea',
].join(',');

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const readOverrides = (): StoredOverrides => {
  try {
    return JSON.parse(localStorage.getItem(overrideStorageKey) ?? '{}') as StoredOverrides;
  } catch {
    return {};
  }
};

const writeOverrides = (records: StoredOverrides) => {
  localStorage.setItem(overrideStorageKey, JSON.stringify(records));
};

const textScore = (element: Element) => {
  const text = element.textContent?.trim() ?? '';
  const special = element.matches('table, figure, pre, details') ? 260 : 0;
  return Math.min(680, text.length + special);
};

const isFixedPresentationGroup = (element: Element) => element.getAttribute('data-presentation-group') === 'single';

const presentationRowLimit = (table: HTMLTableElement, fallback: number) => {
  if (isFixedPresentationGroup(table)) return Number.POSITIVE_INFINITY;
  const requested = Number(table.dataset.presentationRows);
  return Number.isInteger(requested) && requested > 0 ? requested : fallback;
};

const makeTableChunks = (table: HTMLTableElement, size = 2): HTMLElement[] => {
  const rowLimit = presentationRowLimit(table, size);
  const rows = [...table.querySelectorAll('tbody > tr')];
  if (rows.length <= rowLimit) return [table.cloneNode(true) as HTMLElement];
  return Array.from({ length: Math.ceil(rows.length / rowLimit) }, (_, chunkIndex) => {
    const clone = table.cloneNode(true) as HTMLTableElement;
    const body = clone.querySelector('tbody');
    body?.replaceChildren(...rows.slice(chunkIndex * rowLimit, chunkIndex * rowLimit + rowLimit).map((row) => row.cloneNode(true)));
    return clone;
  });
};

const makeListChunks = (list: HTMLOListElement | HTMLUListElement, size = 3, scoreLimit = 290): HTMLElement[] => {
  if (isFixedPresentationGroup(list)) return [list.cloneNode(true) as HTMLElement];
  const items = [...list.children].filter((item) => item.matches('li'));
  const groups: Element[][] = [];
  let group: Element[] = [];
  let score = 0;
  items.forEach((item) => {
    const itemScore = textScore(item);
    if (group.length && (group.length >= size || score + itemScore > scoreLimit)) {
      groups.push(group);
      group = [];
      score = 0;
    }
    group.push(item);
    score += itemScore;
  });
  if (group.length) groups.push(group);
  if (groups.length <= 1) return [list.cloneNode(true) as HTMLElement];
  let itemOffset = 0;
  return groups.map((itemsInGroup) => {
    const clone = list.cloneNode(false) as HTMLOListElement | HTMLUListElement;
    clone.append(...itemsInGroup.map((item) => item.cloneNode(true)));
    if (clone instanceof HTMLOListElement) clone.start = itemOffset + 1;
    itemOffset += itemsInGroup.length;
    return clone;
  });
};

const makeContainerChunks = (container: HTMLElement, directChildren: HTMLElement[]): HTMLElement[] => {
  const units = directChildren.flatMap((child) => normalizeClone(child));
  const groups: HTMLElement[][] = [];
  let group: HTMLElement[] = [];
  let score = 0;
  units.forEach((unit) => {
    const unitScore = textScore(unit);
    const standalone = isFixedPresentationGroup(unit)
      || unit.matches('table, figure, pre, details')
      || Boolean(unit.querySelector('table, figure, img'));
    if (group.length && (standalone || group.length >= 2 || score + unitScore > 310)) {
      groups.push(group);
      group = [];
      score = 0;
    }
    group.push(unit);
    score += unitScore;
    if (standalone) {
      groups.push(group);
      group = [];
      score = 0;
    }
  });
  if (group.length) groups.push(group);
  if (!groups.length) return [container];
  return groups.map((items) => {
    const wrapper = container.cloneNode(false) as HTMLElement;
    if (items.length === 1 && isFixedPresentationGroup(items[0])) {
      wrapper.dataset.presentationGroup = 'single';
    }
    wrapper.append(...items.map((item) => item.cloneNode(true)));
    return wrapper;
  });
};

const normalizeClone = (element: HTMLElement): HTMLElement[] => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(excludedSelector).forEach((item) => item.remove());
  const timedLabels = [
    clone.matches('.lesson-tool-landscape__header') ? clone.querySelector(':scope > span') : null,
    clone.matches('.lesson-classification-examples') ? clone.querySelector(':scope > header > span') : null,
    ...clone.querySelectorAll('.lesson-practice-block > header strong'),
  ].filter(Boolean) as HTMLElement[];
  timedLabels.forEach((label) => {
    label.textContent = (label.textContent ?? '')
      .replace(/^\s*\d+분\s*/, '')
      .replace(/\s*·\s*\d+분\s*$/, '');
  });
  const summaryTime = clone.querySelector('.lesson-summary-grid > div:first-child strong');
  if (summaryTime?.textContent?.includes('총 180분')) summaryTime.textContent = '3시간 수업';
  if (!clone.textContent?.trim() && !clone.querySelector('img, svg, table')) return [];

  if (isFixedPresentationGroup(clone)) return [clone];

  if (clone.matches('table')) return makeTableChunks(clone as HTMLTableElement);
  if (clone.matches('ul, ol')) return makeListChunks(clone as HTMLUListElement | HTMLOListElement);

  const table = clone.querySelector(':scope > table');
  if (table && clone.children.length === 1) return makeTableChunks(table as HTMLTableElement);
  const list = clone.querySelector(':scope > ul, :scope > ol');
  if (list && clone.children.length === 1) return makeListChunks(list as HTMLUListElement | HTMLOListElement);

  if ((clone.matches('pre, .prompt-example, .lesson-prompt, details') || Boolean(clone.querySelector('pre, details')))
    && (clone.textContent?.length ?? 0) > 520) {
    const heading = clone.querySelector('h2, h3, h4, summary, strong')?.textContent?.trim() || '상세 자료';
    const compact = document.createElement('aside');
    compact.className = 'lecture-slide__ebook-note';
    compact.innerHTML = `<strong>${escapeHtml(heading)}</strong><p>전체 요청문과 상세 내용은 전자책에서 확인하세요.</p>`;
    return [compact];
  }

  const direct = [...clone.querySelectorAll<HTMLElement>(blockSelector)]
    .filter((child) => child.parentElement === clone);
  const structurallyDense = direct.length > 2
    || clone.querySelectorAll(':scope li').length > 3
    || clone.querySelectorAll(':scope tr').length > 2
    || clone.matches('.lesson-output-grid, .lesson04-two-column, .lesson04-model-grid, .lesson04-version-grid, .lesson04-registration-groups, .lesson04-delivery-groups, .lesson-section-group, .structured-practice-templates, .lesson-practice-block, .iteration-sample, .empty-space-kit, .time-plan');
  if ((textScore(clone) > 330 || structurallyDense) && direct.length > 1) {
    return makeContainerChunks(clone, direct);
  }
  return [clone];
};

const annotateEditableText = (
  node: HTMLElement,
  contentId: string,
  sectionId: string,
  slideId: string,
  counters: Map<string, number>,
) => {
  const candidates = [...node.querySelectorAll<HTMLElement>('h1, h2, h3, h4, p, li, th, td, figcaption, dt, dd')]
    .filter((element) => {
      if (element.closest('pre, code, a, button')) return false;
      const text = element.textContent?.trim() ?? '';
      return text.length > 0 && text.length <= 700;
    });
  candidates.forEach((element) => {
    const counterKey = `${sectionId}:${element.tagName.toLowerCase()}`;
    const index = (counters.get(counterKey) ?? 0) + 1;
    counters.set(counterKey, index);
    const editKey = `${contentId}/${sectionId}/${element.tagName.toLowerCase()}-${String(index).padStart(2, '0')}`;
    element.dataset.editKey = editKey;
    element.dataset.originalText = element.textContent?.trim() ?? '';
    element.dataset.slideId = slideId;
  });
};

const splitTextNode = (element: HTMLElement): HTMLElement[] => {
  const text = element.textContent ?? '';
  if (text.length < 240) return [];
  const middle = Math.floor(text.length / 2);
  const candidates = [
    text.lastIndexOf('. ', middle),
    text.lastIndexOf('? ', middle),
    text.lastIndexOf('! ', middle),
    text.lastIndexOf('。', middle),
    text.lastIndexOf(' ', middle),
  ].filter((index) => index > Math.floor(text.length * 0.28));
  const cut = (candidates.length ? Math.max(...candidates) + 1 : middle);
  return [text.slice(0, cut), text.slice(cut)].filter(Boolean).map((part) => {
    const clone = element.cloneNode(false) as HTMLElement;
    clone.textContent = part;
    return clone;
  });
};

const splitElement = (element: HTMLElement): HTMLElement[] => {
  if (isFixedPresentationGroup(element)) return [];
  if (element.matches('ul, ol')) {
    const items = [...element.children].filter((child) => child.matches('li'));
    if (items.length > 1) {
      const middle = Math.ceil(items.length / 2);
      return [items.slice(0, middle), items.slice(middle)].filter((group) => group.length).map((group, groupIndex) => {
        const clone = element.cloneNode(false) as HTMLOListElement | HTMLUListElement;
        clone.append(...group.map((item) => item.cloneNode(true)));
        if (clone instanceof HTMLOListElement) {
          const originalStart = (element as HTMLOListElement).start || 1;
          clone.start = groupIndex === 0 ? originalStart : originalStart + middle;
        }
        return clone;
      });
    }
  }
  if (element.matches('table')) {
    const rows = [...element.querySelectorAll('tbody > tr')];
    if (rows.length > 1) {
      const middle = Math.ceil(rows.length / 2);
      return [rows.slice(0, middle), rows.slice(middle)].filter((group) => group.length).map((group) => {
        const clone = element.cloneNode(true) as HTMLTableElement;
        clone.querySelector('tbody')?.replaceChildren(...group.map((row) => row.cloneNode(true)));
        return clone;
      });
    }
  }

  const children = [...element.children] as HTMLElement[];
  const payload = children;
  if (payload.length > 1) {
    const middle = Math.ceil(payload.length / 2);
    return [payload.slice(0, middle), payload.slice(middle)].filter((group) => group.length).map((group) => {
      const clone = element.cloneNode(false) as HTMLElement;
      clone.append(...group.map((child) => child.cloneNode(true)));
      return clone;
    });
  }
  if (payload.length === 1) {
    const childParts = splitElement(payload[0]);
    if (childParts.length > 1) {
      return childParts.map((part) => {
        const clone = element.cloneNode(false) as HTMLElement;
        clone.append(part);
        return clone;
      });
    }
  }
  if (children.length === 0) return splitTextNode(element);
  return [];
};

const refineSlides = (initialSlides: SlideRecord[], contentId: string): SlideRecord[] => {
  const measure = document.createElement('div');
  measure.className = 'lecture-deck lecture-deck--measure';
  measure.setAttribute('aria-hidden', 'true');
  measure.innerHTML = '<div class="lecture-deck__toolbar"></div><div class="lecture-deck__viewport"><article class="lecture-slide"></article></div><div class="lecture-deck__footer"></div>';
  document.body.append(measure);
  const measureStage = measure.querySelector<HTMLElement>('.lecture-slide');
  const fits = (node: HTMLElement) => {
    if (!measureStage) return true;
    measureStage.replaceChildren(node.cloneNode(true));
    const rendered = measureStage.firstElementChild as HTMLElement | null;
    return Boolean(rendered
      && rendered.scrollHeight <= measureStage.clientHeight + 1
      && rendered.scrollWidth <= measureStage.clientWidth + 1);
  };
  const queue = initialSlides.map((slide) => ({ slide, depth: 0 }));
  const refined: SlideRecord[] = [];
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    if (fits(current.slide.node) || current.depth >= 10 || current.slide.sectionId === 'title') {
      refined.push(current.slide);
      continue;
    }
    const body = current.slide.node;
    const heading = body.querySelector(':scope > .lecture-slide__heading') as HTMLElement | null;
    const content = [...body.children].filter((child) => child !== heading) as HTMLElement[];
    let chunks: HTMLElement[][] = [];
    if (content.length > 1) {
      const middle = Math.ceil(content.length / 2);
      chunks = [content.slice(0, middle), content.slice(middle)].filter((group) => group.length);
    } else if (content.length === 1) {
      chunks = splitElement(content[0]).map((element) => [element]);
    }
    if (chunks.length <= 1) {
      body.classList.add('lecture-slide__unsplittable');
      refined.push(current.slide);
      continue;
    }
    queue.unshift(...chunks.map((chunk) => {
      const node = body.cloneNode(false) as HTMLElement;
      if (heading) node.append(heading.cloneNode(true));
      node.append(...chunk.map((item) => item.cloneNode(true)));
      return { slide: { ...current.slide, node }, depth: current.depth + 1 };
    }));
  }
  measure.remove();

  const totals = new Map<string, number>();
  refined.forEach((slide) => totals.set(slide.sectionId, (totals.get(slide.sectionId) ?? 0) + 1));
  const positions = new Map<string, number>();
  refined.forEach((slide) => {
    if (slide.sectionId === 'title') return;
    const position = (positions.get(slide.sectionId) ?? 0) + 1;
    positions.set(slide.sectionId, position);
    const total = totals.get(slide.sectionId) ?? 1;
    slide.id = `${contentId}-${slide.sectionId}-${String(position).padStart(2, '0')}`;
    slide.title = total > 1 ? `${slide.sectionLabel} · ${position}` : slide.sectionLabel;
    const counter = slide.node.querySelector<HTMLElement>('.lecture-slide__heading small');
    if (counter) counter.textContent = `${position} / ${total}`;
    else if (total > 1) {
      const small = document.createElement('small');
      small.textContent = `${position} / ${total}`;
      slide.node.querySelector('.lecture-slide__heading')?.append(small);
    }
  });
  const editCounters = new Map<string, number>();
  refined.forEach((slide) => annotateEditableText(slide.node, contentId, slide.sectionId, slide.id, editCounters));
  return refined;
};

const buildSlides = (root: HTMLElement): SlideRecord[] => {
  const source = root.querySelector<HTMLElement>('[data-deck-source]');
  if (!source) return [];
  const contentId = root.dataset.contentId ?? 'course-overview';
  const isLectureStart = contentId === 'lecture-start';
  const introduction = source.querySelector<HTMLElement>('[data-instructor-introduction]');
  const buildIntroductionSlide = () => {
    if (!introduction) return null;
    const node = introduction.cloneNode(true) as HTMLElement;
    const slideId = 'instructor-introduction';
    annotateEditableText(node, 'instructor-introduction', 'instructor-introduction', slideId, new Map());
    return {
      id: slideId,
      sectionId: 'instructor-introduction',
      sectionLabel: '강사 소개',
      title: '강사 소개 · 오경식',
      node,
    } satisfies SlideRecord;
  };
  const introductionSlide = buildIntroductionSlide();
  if (introductionSlide && !isLectureStart) {
    return [introductionSlide];
  }
  const slideContentId = isLectureStart ? 'course-overview' : contentId;
  const slides: SlideRecord[] = introductionSlide ? [introductionSlide] : [];
  const titleSlide = document.createElement('div');
  titleSlide.className = 'lecture-slide__title-card';
  titleSlide.innerHTML = `
    <p>${escapeHtml(root.dataset.kicker ?? '')}</p>
    <h1>${escapeHtml(root.dataset.title ?? '')}</h1>
    ${root.dataset.topic ? `<strong>${escapeHtml(root.dataset.topic)}</strong>` : ''}
  `;
  slides.push({
    id: `${slideContentId}-title`,
    sectionId: 'title',
    sectionLabel: '차시 제목',
    title: root.dataset.title ?? '',
    node: titleSlide,
  });

  const sections = [...source.querySelectorAll<HTMLElement>('.lesson-section, .course-overview-section')]
    .filter((section) => !section.parentElement?.closest('.lesson-section, .course-overview-section'));
  sections.forEach((section, sectionIndex) => {
    const sectionId = section.id || `section-${String(sectionIndex + 1).padStart(2, '0')}`;
    const sectionLabel = section.querySelector(':scope > .section-heading h2, :scope > header h2')?.textContent?.trim()
      || `섹션 ${sectionIndex + 1}`;
    const contentChildren = [...section.children]
      .filter((child) => !child.matches(excludedSelector))
      .filter((child) => !child.matches('.section-heading')) as HTMLElement[];
    const units = contentChildren.flatMap((child) => normalizeClone(child));
    const groups: HTMLElement[][] = [];
    let current: HTMLElement[] = [];
    let score = 0;
    units.forEach((unit) => {
      const unitScore = textScore(unit);
      const standalone = isFixedPresentationGroup(unit)
        || unit.matches('table, figure, pre, details')
        || Boolean(unit.querySelector('table, figure, img'));
      if (current.length && (standalone || score + unitScore > 520 || current.length >= 2)) {
        groups.push(current);
        current = [];
        score = 0;
      }
      current.push(unit);
      score += unitScore;
      if (standalone) {
        groups.push(current);
        current = [];
        score = 0;
      }
    });
    if (current.length) groups.push(current);
    if (!groups.length) groups.push([]);

    groups.forEach((group, groupIndex) => {
      const slideId = `${slideContentId}-${sectionId}-${String(groupIndex + 1).padStart(2, '0')}`;
      const wrapper = document.createElement('div');
      wrapper.className = 'lecture-slide__body';
      const heading = document.createElement('header');
      heading.className = 'lecture-slide__heading';
      heading.innerHTML = `<span>${String(sectionIndex + 1).padStart(2, '0')}</span><h2>${escapeHtml(sectionLabel)}</h2>${groups.length > 1 ? `<small>${groupIndex + 1} / ${groups.length}</small>` : ''}`;
      wrapper.append(heading, ...group);
      slides.push({
        id: slideId,
        sectionId,
        sectionLabel,
        title: groups.length > 1 ? `${sectionLabel} · ${groupIndex + 1}` : sectionLabel,
        node: wrapper,
      });
    });
  });
  return slides;
};

const applyOverrides = (root: HTMLElement, slide: SlideRecord) => {
  const records = readOverrides();
  root.querySelectorAll<HTMLElement>('[data-edit-key]').forEach((element) => {
    const record = records[element.dataset.editKey ?? ''];
    if (record?.slideId === slide.id) {
      element.textContent = record.replacementText;
      element.dataset.locallyModified = 'true';
    }
  });
};

const readBuildManifest = (
  root: HTMLElement,
  buildId: string,
  deckId: string,
  contentId: string,
): SlideRecord[] | null => {
  const manifestElement = document.querySelector<HTMLScriptElement>(
    `script[type="application/json"][data-deck-manifest="${CSS.escape(deckId)}"]`,
  );
  if (!manifestElement?.textContent) return null;
  try {
    const manifest = JSON.parse(manifestElement.textContent) as SlideManifest;
    if (
      manifest.schemaVersion !== 1
      || manifest.buildId !== buildId
      || manifest.deckId !== deckId
      || manifest.contentId !== contentId
      || manifest.referenceViewport?.width !== 1280
      || manifest.referenceViewport?.height !== 720
      || !Array.isArray(manifest.slides)
    ) return null;
    const slides = manifest.slides.map((record, slideIndex) => {
      if (record.slideIndex !== slideIndex || !record.id || !record.html) throw new Error('invalid slide record');
      const template = document.createElement('template');
      template.innerHTML = record.html.trim();
      const node = template.content.firstElementChild;
      if (!(node instanceof HTMLElement)) throw new Error('invalid slide markup');
      return {
        id: record.id,
        sectionId: record.sectionId,
        sectionLabel: record.sectionLabel,
        title: record.title,
        node,
      } satisfies SlideRecord;
    });
    if (new Set(slides.map((slide) => slide.id)).size !== slides.length) return null;
    root.dataset.manifestBuildId = manifest.buildId;
    return slides;
  } catch {
    return null;
  }
};

const initializeDeck = async (root: HTMLElement) => {
  if (root.dataset.deckReady === 'true' || root.dataset.deckReady === 'loading') return;
  root.dataset.deckReady = 'loading';
  await document.fonts?.ready;
  const contentId = root.dataset.contentId ?? 'course-overview';
  const buildId = root.dataset.buildId ?? 'local-working-tree';
  const deckId = root.dataset.deckId ?? contentId;
  const lessonId = contentId.startsWith('lesson-') ? contentId.slice('lesson-'.length) : contentId;
  const manifestSlides = readBuildManifest(root, buildId, deckId, contentId);
  const generatedSlides = buildSlides(root);
  const slides = manifestSlides ?? (
    contentId === 'instructor-introduction'
      ? generatedSlides
      : contentId === 'lecture-start'
        ? [generatedSlides[0], ...refineSlides(generatedSlides.slice(1), 'course-overview')].filter(Boolean) as SlideRecord[]
        : refineSlides(generatedSlides, contentId)
  );
  root.dataset.deckManifestSource = manifestSlides ? 'build' : 'runtime-reference';
  const stage = root.querySelector<HTMLElement>('[data-deck-slide]');
  const viewport = root.querySelector<HTMLElement>('[data-deck-viewport]');
  const overview = root.querySelector<HTMLElement>('[data-deck-overview]');
  const overviewList = root.querySelector<HTMLOListElement>('[data-deck-overview-list]');
  const number = root.querySelector<HTMLElement>('[data-deck-number]');
  const total = root.querySelector<HTMLElement>('[data-deck-total]');
  const section = root.querySelector<HTMLElement>('[data-deck-section]');
  const progress = root.querySelector<HTMLElement>('[data-deck-progress]');
  const firstLesson = root.querySelector<HTMLElement>('[data-deck-first-lesson]');
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel(channelName) : null;
  let activeIndex = 0;

  if (!stage || slides.length === 0) return;
  root.dataset.deckReady = 'true';
  if (total) total.textContent = String(slides.length);

  const render = (index: number, options: { broadcast?: boolean; persist?: boolean } = {}) => {
    activeIndex = Math.max(0, Math.min(slides.length - 1, index));
    const slide = slides[activeIndex];
    stage.replaceChildren(slide.node.cloneNode(true));
    applyOverrides(stage, slide);
    stage.dataset.slideId = slide.id;
    stage.dataset.sectionId = slide.sectionId;
    if (number) number.textContent = String(activeIndex + 1);
    if (section) section.textContent = slide.sectionLabel;
    if (progress) progress.style.transform = `scaleX(${(activeIndex + 1) / slides.length})`;
    if (firstLesson) firstLesson.hidden = contentId !== 'lecture-start' || activeIndex !== slides.length - 1;
    overviewList?.querySelectorAll('button').forEach((button, buttonIndex) => {
      button.setAttribute('aria-current', buttonIndex === activeIndex ? 'true' : 'false');
    });
    if (options.persist !== false) {
      sessionStorage.setItem(`${slideStorageKey}:${contentId}`, slide.id);
    }
    root.dispatchEvent(new CustomEvent('lecture-deck-change', {
      bubbles: true,
      detail: { buildId, deckId, lessonId, contentId, slide, activeIndex, slides },
    }));
    if (options.broadcast !== false && root.dataset.deckRole === 'console') {
      channel?.postMessage({
        type: 'slide-sync',
        buildId,
        deckId,
        lessonId,
        slideId: slide.id,
        slideIndex: activeIndex,
        timestamp: Date.now(),
      });
    }
  };

  const move = (offset: number) => render(activeIndex + offset);
  const toggleOverview = (force?: boolean) => {
    if (!overview) return;
    const shouldOpen = force ?? overview.hidden;
    overview.hidden = !shouldOpen;
    root.querySelector('[data-deck-action="overview"]')?.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) overview.querySelector<HTMLElement>('button')?.focus();
    else viewport?.focus();
  };

  if (overviewList) {
    slides.forEach((slide, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(slide.title)}</strong>`;
      button.addEventListener('click', () => {
        render(index);
        toggleOverview(false);
      });
      item.append(button);
      overviewList.append(item);
    });
  }

  root.querySelector('[data-deck-action="previous"]')?.addEventListener('click', () => move(-1));
  root.querySelector('[data-deck-action="next"]')?.addEventListener('click', () => move(1));
  root.querySelector('[data-deck-action="overview"]')?.addEventListener('click', () => toggleOverview());
  root.querySelector('[data-deck-action="close-overview"]')?.addEventListener('click', () => toggleOverview(false));
  root.querySelector('[data-deck-action="fullscreen"]')?.addEventListener('click', () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.requestFullscreen();
  });

  root.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
    const actions: Record<string, () => void> = {
      ArrowRight: () => move(1),
      ArrowLeft: () => move(-1),
      ' ': () => move(1),
      PageDown: () => move(1),
      PageUp: () => move(-1),
      Home: () => render(0),
      End: () => render(slides.length - 1),
      Escape: () => toggleOverview(),
      f: () => root.querySelector<HTMLElement>('[data-deck-action="fullscreen"]')?.click(),
      F: () => root.querySelector<HTMLElement>('[data-deck-action="fullscreen"]')?.click(),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  });

  channel?.addEventListener('message', (event) => {
    const message = event.data;
    if (!message || typeof message !== 'object') return;
    const sameDeck = message.buildId === buildId && message.deckId === deckId;
    if (message.type === 'slide-sync' && sameDeck && root.dataset.deckRole !== 'console') {
      const index = slides.findIndex((slide) => slide.id === message.slideId);
      if (index >= 0 && index === Number(message.slideIndex)) render(index, { broadcast: false });
    }
    if (message.type === 'slide-overrides-updated' && sameDeck) render(activeIndex, { broadcast: false, persist: false });
    if (message.type === 'ping' && sameDeck && root.dataset.deckRole === 'projector') {
      channel.postMessage({
        type: 'pong',
        buildId,
        deckId,
        lessonId,
        slideId: slides[activeIndex]?.id,
        slideIndex: activeIndex,
        timestamp: Date.now(),
      });
    }
  });
  window.addEventListener('storage', (event) => {
    if (event.key === overrideStorageKey) render(activeIndex, { broadcast: false, persist: false });
  });

  const storedSlideId = sessionStorage.getItem(`${slideStorageKey}:${contentId}`);
  const initialIndex = Math.max(0, slides.findIndex((slide) => slide.id === storedSlideId));
  render(initialIndex, { broadcast: false });

  if (root.dataset.deckRole === 'projector') {
    channel?.postMessage({
      type: 'projector-ready',
      buildId,
      deckId,
      lessonId,
      slideId: slides[initialIndex]?.id,
      slideIndex: initialIndex,
      timestamp: Date.now(),
    });
    window.addEventListener('beforeunload', () => {
      channel?.postMessage({
        type: 'projector-closing',
        buildId,
        deckId,
        lessonId,
        slideId: slides[activeIndex]?.id,
        slideIndex: activeIndex,
        timestamp: Date.now(),
      });
    });
  }
  requestAnimationFrame(() => viewport?.focus());

  (root as HTMLElement & { lectureDeck?: unknown }).lectureDeck = {
    buildId,
    deckId,
    lessonId,
    slides,
    render,
    move,
    getActiveIndex: () => activeIndex,
    readOverrides,
    writeOverrides,
    overrideStorageKey,
    channel,
  };
  root.dispatchEvent(new CustomEvent('lecture-deck-ready', { bubbles: true, detail: { slides, render } }));
};

export const initializeLectureDecks = () => {
  document.querySelectorAll<HTMLElement>('[data-lecture-deck]').forEach(initializeDeck);
};

export type { OverrideRecord, SlideRecord, StoredOverrides };

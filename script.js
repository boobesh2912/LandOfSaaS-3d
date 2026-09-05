/* ============================================
   LandOfSaaS — Cohesive Political Map SVG Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 24 CONNECTED POLITICAL TERRITORIES (Tessellated, zero gaps, zero overlaps) ───
  const DISTRICTS = [
    // === 1. AI CONTINENT ===
    {
      id: "ai-core",
      name: "AI Core",
      continent: "AI Continent",
      area: 42,
      status: "owned",
      owner: { name: "OpenAI", logo: "⬡", color: "#10a37f" },
      center: { x: 360, y: 125 },
      path: "M 310,90 Q 360,75 410,90 L 410,160 L 310,160 Z"
    },
    {
      id: "ai-research",
      name: "Research",
      continent: "AI Continent",
      area: 28,
      status: "available",
      center: { x: 460, y: 125 },
      path: "M 410,90 Q 460,75 510,95 L 510,160 L 410,160 Z"
    },
    {
      id: "ai-data",
      name: "Data",
      continent: "AI Continent",
      area: 18,
      status: "available",
      center: { x: 360, y: 195 },
      path: "M 310,160 L 410,160 L 410,230 Q 360,245 310,230 Z"
    },
    {
      id: "ai-automation",
      name: "Automation",
      continent: "AI Continent",
      area: 36,
      status: "available",
      center: { x: 460, y: 195 },
      path: "M 410,160 L 510,160 Q 520,225 460,240 L 410,230 Z"
    },

    // === 2. DEVELOPER CONTINENT ===
    {
      id: "dev-infra",
      name: "Infrastructure",
      continent: "Developer Continent",
      area: 38,
      status: "owned",
      owner: { name: "GitHub", logo: "🐙", color: "#24292e" },
      center: { x: 745, y: 115 },
      path: "M 690,80 Q 750,65 800,80 L 800,150 L 690,150 Z"
    },
    {
      id: "dev-tools",
      name: "Dev Tools",
      continent: "Developer Continent",
      area: 26,
      status: "owned",
      owner: { name: "Vercel", logo: "▲", color: "#000000" },
      center: { x: 855, y: 115 },
      path: "M 800,80 Q 860,65 910,85 L 910,150 L 800,150 Z"
    },
    {
      id: "dev-sec",
      name: "Security",
      continent: "Developer Continent",
      area: 22,
      status: "owned",
      owner: { name: "Figma", logo: "❖", color: "#f24e1e" },
      center: { x: 745, y: 185 },
      path: "M 690,150 L 800,150 L 800,220 Q 740,235 690,220 Z"
    },
    {
      id: "dev-cloud",
      name: "Cloud",
      continent: "Developer Continent",
      area: 32,
      status: "available",
      center: { x: 855, y: 185 },
      path: "M 800,150 L 910,150 Q 925,215 870,230 L 800,220 Z"
    },

    // === 3. SAAS CONTINENT ===
    {
      id: "saas-b2b",
      name: "B2B",
      continent: "SaaS Continent",
      area: 40,
      status: "owned",
      owner: { name: "HubSpot", logo: "H", color: "#ff7a59" },
      center: { x: 500, y: 395 },
      path: "M 440,360 Q 500,340 560,360 L 560,430 L 440,430 Z"
    },
    {
      id: "saas-growth",
      name: "Growth",
      continent: "SaaS Continent",
      area: 34,
      status: "owned",
      owner: { name: "Notion", logo: "N", color: "#111827" },
      center: { x: 615, y: 395 },
      path: "M 560,360 Q 620,340 670,360 L 670,430 L 560,430 Z"
    },
    {
      id: "saas-analytics",
      name: "Analytics",
      continent: "SaaS Continent",
      area: 22,
      status: "owned",
      owner: { name: "Canva", logo: "C", color: "#00c4cc" },
      center: { x: 500, y: 465 },
      path: "M 440,430 L 560,430 L 560,500 Q 500,520 440,500 Z"
    },
    {
      id: "saas-market",
      name: "Marketplace",
      continent: "SaaS Continent",
      area: 26,
      status: "available",
      center: { x: 615, y: 465 },
      path: "M 560,430 L 670,430 Q 680,495 620,510 L 560,500 Z"
    },

    // === 4. MARKETING CONTINENT ===
    {
      id: "mkt-content",
      name: "Content",
      continent: "Marketing Continent",
      area: 20,
      status: "owned",
      owner: { name: "Stripe", logo: "S", color: "#635bff" },
      center: { x: 175, y: 435 },
      path: "M 120,400 Q 180,380 230,400 L 230,470 L 120,470 Z"
    },
    {
      id: "mkt-social",
      name: "Social",
      continent: "Marketing Continent",
      area: 24,
      status: "owned",
      owner: { name: "Coinbase", logo: "C", color: "#0052ff" },
      center: { x: 285, y: 435 },
      path: "M 230,400 Q 290,380 340,400 L 340,470 L 230,470 Z"
    },
    {
      id: "mkt-branding",
      name: "Branding",
      continent: "Marketing Continent",
      area: 32,
      status: "available",
      center: { x: 175, y: 500 },
      path: "M 120,470 L 230,470 L 230,530 Q 170,545 120,520 Z"
    },
    {
      id: "mkt-seo",
      name: "SEO",
      continent: "Marketing Continent",
      area: 28,
      status: "available",
      center: { x: 285, y: 500 },
      path: "M 230,470 L 340,470 Q 350,535 290,550 L 230,530 Z"
    },

    // === 5. CREATOR CONTINENT ===
    {
      id: "crt-design",
      name: "Design",
      continent: "Creator Continent",
      area: 28,
      status: "owned",
      owner: { name: "Discord", logo: "🎮", color: "#5865f2" },
      center: { x: 770, y: 525 },
      path: "M 720,490 Q 770,475 820,490 L 820,560 L 720,560 Z"
    },
    {
      id: "crt-vision",
      name: "Vision",
      continent: "Creator Continent",
      area: 26,
      status: "owned",
      owner: { name: "Slack", logo: "#", color: "#4a154b" },
      center: { x: 870, y: 525 },
      path: "M 820,490 Q 870,475 920,490 L 920,560 L 820,560 Z"
    },
    {
      id: "crt-art",
      name: "Art",
      continent: "Creator Continent",
      area: 22,
      status: "owned",
      owner: { name: "Linear", logo: "◈", color: "#5e6ad2" },
      center: { x: 770, y: 595 },
      path: "M 720,560 L 820,560 L 820,630 Q 770,645 720,630 Z"
    },
    {
      id: "crt-music",
      name: "Music",
      continent: "Creator Continent",
      area: 18,
      status: "available",
      center: { x: 870, y: 595 },
      path: "M 820,560 L 920,560 Q 930,625 870,640 L 820,630 Z"
    },

    // === 6. OPEN CONTINENT ===
    {
      id: "open-ideas",
      name: "Ideas",
      continent: "Open Continent",
      area: 18,
      status: "available",
      center: { x: 445, y: 630 },
      path: "M 400,600 Q 450,585 490,600 L 490,660 L 400,660 Z"
    },
    {
      id: "open-exp",
      name: "Experimental",
      continent: "Open Continent",
      area: 30,
      status: "available",
      center: { x: 535, y: 630 },
      path: "M 490,600 Q 540,585 580,600 L 580,660 L 490,660 Z"
    },
    {
      id: "open-edu",
      name: "Education",
      continent: "Open Continent",
      area: 22,
      status: "available",
      center: { x: 620, y: 630 },
      path: "M 580,600 Q 620,585 660,600 L 660,660 L 580,660 Z"
    },
    {
      id: "open-other",
      name: "Other",
      continent: "Open Continent",
      area: 24,
      status: "available",
      center: { x: 535, y: 685 },
      path: "M 490,660 L 580,660 Q 570,715 520,720 L 490,710 Z"
    }
  ];

  // Continent Zone Header Titles
  const CONTINENT_HEADERS = [
    { title: "AI Continent", sub: "Build Smarter", x: 410, y: 55 },
    { title: "Developer Continent", sub: "Build Faster", x: 800, y: 45 },
    { title: "SaaS Continent", sub: "All Startups. One Place.", x: 555, y: 320 },
    { title: "Marketing Continent", sub: "Get Noticed", x: 230, y: 360 },
    { title: "Creator Continent", sub: "Inspire More", x: 820, y: 450 },
    { title: "Open Continent", sub: "For Everything Else", x: 530, y: 575 }
  ];

  // State Management
  const selectedDistrictIds = new Set();
  const districtsLayer = document.getElementById('districts-layer');

  // DOM Elements
  const territoryArea = document.getElementById('territory-area');
  const territoryPrice = document.getElementById('territory-price');
  const territoryDetail = document.getElementById('territory-detail');
  const ownBtn = document.getElementById('own-territory-btn');
  const panelTags = document.getElementById('panel-tags');
  const panelResetBtn = document.getElementById('panel-reset-btn');

  // Floating Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  document.body.appendChild(tooltip);

  // ─── RENDER COHESIVE POLITICAL SVG MAP ───
  function renderPoliticalMap() {
    if (!districtsLayer) return;
    districtsLayer.innerHTML = '';

    // Render Continent Header Titles
    CONTINENT_HEADERS.forEach(c => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "zone-label");
      g.setAttribute("transform", `translate(${c.x}, ${c.y})`);

      const t1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t1.setAttribute("class", "zone-label__title");
      t1.setAttribute("text-anchor", "middle");
      t1.textContent = c.title;

      const t2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t2.setAttribute("class", "zone-label__sub");
      t2.setAttribute("y", "13");
      t2.setAttribute("text-anchor", "middle");
      t2.textContent = c.sub;

      g.appendChild(t1);
      g.appendChild(t2);
      districtsLayer.appendChild(g);
    });

    // Render 24 Tessellated Political Territories
    DISTRICTS.forEach(d => {
      const isSelected = selectedDistrictIds.has(d.id);

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", `district-group district-group--${d.status}`);
      g.setAttribute("data-id", d.id);

      // SVG Path
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d.path);
      path.setAttribute("class", `map-district map-district--${isSelected ? 'selected' : d.status}`);
      path.setAttribute("data-id", d.id);

      if (d.status === "owned") {
        path.style.fill = d.owner.color;
        path.style.opacity = "0.82";
      }

      g.appendChild(path);

      // Territory Name & Area Text Label Overlay (Matches Image 3)
      if (d.status !== "owned") {
        const textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        textGroup.setAttribute("class", "territory-label-text");
        textGroup.setAttribute("transform", `translate(${d.center.x}, ${d.center.y})`);

        const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        titleText.setAttribute("x", "0");
        titleText.setAttribute("y", "-2");
        titleText.setAttribute("text-anchor", "middle");
        titleText.setAttribute("class", "territory-label__title");
        titleText.textContent = d.name;
        textGroup.appendChild(titleText);

        const areaText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        areaText.setAttribute("x", "0");
        areaText.setAttribute("y", "10");
        areaText.setAttribute("text-anchor", "middle");
        areaText.setAttribute("class", "territory-label__area");
        areaText.textContent = `${d.area} km²`;
        textGroup.appendChild(areaText);

        g.appendChild(textGroup);
      } else if (d.owner) {
        // Owned District Brand Badge Overlay
        const badge = document.createElementNS("http://www.w3.org/2000/svg", "g");
        badge.setAttribute("class", "district-badge");
        badge.setAttribute("transform", `translate(${d.center.x}, ${d.center.y})`);

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", "-38");
        rect.setAttribute("y", "-24");
        rect.setAttribute("width", "76");
        rect.setAttribute("height", "48");
        rect.setAttribute("rx", "10");
        rect.setAttribute("class", "district-badge__bg");
        badge.appendChild(rect);

        const logoText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        logoText.setAttribute("x", "0");
        logoText.setAttribute("y", "-6");
        logoText.setAttribute("text-anchor", "middle");
        logoText.setAttribute("class", "district-badge__logo");
        logoText.setAttribute("fill", d.owner.color);
        logoText.setAttribute("font-size", "14");
        logoText.textContent = d.owner.logo;
        badge.appendChild(logoText);

        const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        nameText.setAttribute("x", "0");
        nameText.setAttribute("y", "9");
        nameText.setAttribute("text-anchor", "middle");
        nameText.setAttribute("class", "district-badge__name");
        nameText.textContent = d.owner.name;
        badge.appendChild(nameText);

        const areaText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        areaText.setAttribute("x", "0");
        areaText.setAttribute("y", "19");
        areaText.setAttribute("text-anchor", "middle");
        areaText.setAttribute("class", "district-badge__area");
        areaText.textContent = `${d.area} km²`;
        badge.appendChild(areaText);

        g.appendChild(badge);
      }

      // Event Handlers
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDistrictClick(d);
      });

      g.addEventListener('mouseenter', (e) => handleDistrictHover(e, d));
      g.addEventListener('mousemove', (e) => updateTooltipPosition(e));
      g.addEventListener('mouseleave', () => hideTooltip());

      districtsLayer.appendChild(g);
    });
  }

  // ─── CLICK & MULTI-SELECT INTERACTION ───
  function handleDistrictClick(d) {
    if (d.status === "owned") {
      showOwnerNotice(d);
      return;
    }

    if (selectedDistrictIds.has(d.id)) {
      selectedDistrictIds.delete(d.id);
    } else {
      selectedDistrictIds.add(d.id);
    }

    updateSelectionUI();
    renderPoliticalMap();
  }

  function updateSelectionUI() {
    const selectedDistricts = DISTRICTS.filter(d => selectedDistrictIds.has(d.id));
    const totalArea = selectedDistricts.reduce((sum, d) => sum + d.area, 0);
    const totalPrice = totalArea * 2; // $2 per km²

    territoryArea.textContent = `${totalArea} km²`;
    territoryPrice.textContent = `$${totalPrice}`;
    territoryDetail.textContent = `${selectedDistricts.length} territor${selectedDistricts.length === 1 ? 'y' : 'ies'} selected`;

    if (selectedDistricts.length > 0) {
      ownBtn.removeAttribute('disabled');
      ownBtn.innerHTML = `Own ${selectedDistricts.length} Territory ($${totalPrice}) <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      panelResetBtn.style.display = 'inline-block';
    } else {
      ownBtn.setAttribute('disabled', 'true');
      ownBtn.innerHTML = `Own This Territory <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      panelResetBtn.style.display = 'none';
    }

    if (selectedDistricts.length === 0) {
      panelTags.innerHTML = '<span class="panel-tag-empty">Click any territory on map to select</span>';
    } else {
      panelTags.innerHTML = selectedDistricts.map(d => `
        <span class="panel-tag">
          ${d.name} (${d.area}km²)
          <span class="panel-tag__remove" data-id="${d.id}">✕</span>
        </span>
      `).join('');

      panelTags.querySelectorAll('.panel-tag__remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedDistrictIds.delete(btn.dataset.id);
          updateSelectionUI();
          renderPoliticalMap();
        });
      });
    }
  }

  panelResetBtn?.addEventListener('click', () => {
    selectedDistrictIds.clear();
    updateSelectionUI();
    renderPoliticalMap();
  });

  ownBtn?.addEventListener('click', () => {
    if (selectedDistrictIds.size === 0) return;
    ownBtn.textContent = '✓ Territory Reserved!';
    ownBtn.style.background = '#22c55e';
    ownBtn.style.pointerEvents = 'none';

    setTimeout(() => {
      selectedDistrictIds.clear();
      updateSelectionUI();
      renderPoliticalMap();
      ownBtn.style.background = '';
      ownBtn.style.pointerEvents = '';
    }, 2000);
  });

  // ─── TOOLTIP LOGIC ───
  function handleDistrictHover(e, d) {
    const isSelected = selectedDistrictIds.has(d.id);
    const price = d.area * 2;

    let statusHtml = '';
    if (isSelected) {
      statusHtml = '<span class="map-tooltip__status map-tooltip__status--selected">✓ Selected</span>';
    } else if (d.status === 'owned') {
      statusHtml = `<span class="map-tooltip__status map-tooltip__status--owned">Owned by ${d.owner.name}</span>`;
    } else {
      statusHtml = '<span class="map-tooltip__status map-tooltip__status--available">Available ($2/km²)</span>';
    }

    tooltip.innerHTML = `
      <div class="map-tooltip__header">${d.name}</div>
      <div class="map-tooltip__continent">${d.continent}</div>
      <div class="map-tooltip__row">
        <span>Area: <strong>${d.area} km²</strong></span>
        <span class="map-tooltip__price">$${price}</span>
      </div>
      ${statusHtml}
    `;

    tooltip.style.opacity = '1';
    updateTooltipPosition(e);
  }

  function updateTooltipPosition(e) {
    tooltip.style.left = (e.clientX + 16) + 'px';
    tooltip.style.top = (e.clientY - 12) + 'px';
  }

  function hideTooltip() { tooltip.style.opacity = '0'; }

  function showOwnerNotice(d) {
    tooltip.innerHTML = `
      <div class="map-tooltip__header">👑 ${d.owner ? d.owner.name : 'Claimed Territory'}</div>
      <div class="map-tooltip__continent">${d.name} (${d.area} km²)</div>
      <div class="map-tooltip__status map-tooltip__status--owned">Already Claimed &amp; Owned</div>
    `;
    tooltip.style.opacity = '1';
    setTimeout(() => hideTooltip(), 2000);
  }

  // ─── MAP ZOOM CONTROLS ───
  const mapSvg = document.getElementById('map-svg');
  let scale = 1;
  const MIN_SCALE = 0.7;
  const MAX_SCALE = 2.2;

  document.getElementById('zoom-in')?.addEventListener('click', () => {
    scale = Math.min(MAX_SCALE, scale + 0.2);
    applyZoom();
  });

  document.getElementById('zoom-out')?.addEventListener('click', () => {
    scale = Math.max(MIN_SCALE, scale - 0.2);
    applyZoom();
  });

  document.getElementById('zoom-reset')?.addEventListener('click', () => {
    scale = 1;
    applyZoom();
  });

  function applyZoom() {
    mapSvg.style.transform = `scale(${scale})`;
    mapSvg.style.transformOrigin = 'center center';
    mapSvg.style.transition = 'transform 0.3s ease-out';
  }

  // ─── CTA SCROLL ───
  document.getElementById('cta-start')?.addEventListener('click', () => {
    document.getElementById('map-viewport')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Header scroll shadow
  window.addEventListener('scroll', () => {
    document.getElementById('header')?.classList.toggle('header--scrolled', window.scrollY > 30);
  }, { passive: true });

  // Init
  renderPoliticalMap();
  updateSelectionUI();

  console.log("🗺️ LandOfSaaS Political Map SVG System Initialized!");
});

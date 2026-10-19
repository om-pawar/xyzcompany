/**
 * AuctionVault - Main Application Logic & Live Bidding Engine
 */

class AuctionVaultApp {
  constructor() {
    this.catalog = JSON.parse(JSON.stringify(INITIAL_CATALOG));
    this.activeLotId = "lot-101";
    this.activeCategory = "all";
    this.currentView = "homepage";
    this.sellerSubTab = "wizard";
    this.currentWizardStep = 1;
    this.simulationActive = true;
    
    // User state
    this.watchlist = new Set(JSON.parse(localStorage.getItem('av_watchlist') || '["lot-101", "lot-102"]'));
    this.proxyBids = {}; // { lotId: maxAmount }
    this.sellerConsignments = [];

    // Timers
    this.tickerTimer = null;
    this.simulationTimer = null;
    this.inspectionTimerSeconds = 36 * 3600 + 14 * 60; // 36h 14m for demo
  }

  init() {
    console.log("Initializing AuctionVault platform...");

    // Initialize consignments with a couple of existing lots for seller view
    this.sellerConsignments = [this.catalog[0], this.catalog[3]];

    // Render components
    this.renderTopTicker();
    this.renderCategoryPills();
    this.renderLotOfTheDay();
    this.renderCatalogGrid();
    this.renderArenaLot();
    this.renderSellerTracker();
    this.renderCertificateVault();
    this.updateWatchlistUI();

    // Setup interactive events (Zoom lens, Audio toggles)
    this.setupZoomLens();
    this.setupAudioToggle();

    // Start Real-Time Loops
    this.startCountdownLoop();
    this.startFloorSimulationLoop();

    // Handle deep navigation or popstate if needed
    window.app = this;
  }

  // =========================================================================
  // VIEW SWITCHING SYSTEM
  // =========================================================================
  switchView(viewName) {
    this.currentView = viewName;

    // Toggle active views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active-view'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update main navbar button highlights
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeNavBtn = document.getElementById(`nav-btn-${viewName}`);
    if (activeNavBtn) activeNavBtn.classList.add('active');

    // If switching to arena, ensure active lot is fresh
    if (viewName === 'arena') {
      this.renderArenaLot();
    }
  }

  // =========================================================================
  // TOP DYNAMIC AUCTION TICKER
  // =========================================================================
  renderTopTicker() {
    const container = document.getElementById('ticker-live-items');
    if (!container) return;

    container.innerHTML = this.catalog.map(lot => {
      const timeStr = this.formatTime(lot.timeLeftSeconds);
      const isUrgent = lot.timeLeftSeconds < 180 ? 'style="color: var(--accent-alert);"' : '';
      return `
        <div class="ticker-item" onclick="app.selectLotForArena('${lot.id}')" title="Click to open ${lot.title} in Bidding Arena">
          <span class="ticker-lot-name">${lot.lotNumber}: ${lot.title}</span>
          <span class="ticker-bid">$${lot.currentBid.toLocaleString()}</span>
          <span class="ticker-time" ${isUrgent}><i class="fa-regular fa-clock"></i> ${timeStr}</span>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // COUNTDOWN TIMERS & TICK LOGIC
  // =========================================================================
  startCountdownLoop() {
    setInterval(() => {
      let lotOfDayUpdated = false;
      let arenaUpdated = false;

      this.catalog.forEach(lot => {
        if (lot.timeLeftSeconds > 0) {
          lot.timeLeftSeconds--;
        } else if (lot.status === 'active') {
          lot.status = 'ended';
          this.handleAuctionEnded(lot);
        }

        // Slight live viewer fluctuation for realism
        if (Math.random() > 0.75) {
          const delta = Math.floor(Math.random() * 5) - 2;
          lot.viewersCount = Math.max(12, lot.viewersCount + delta);
        }
      });

      // Update Ticker Times
      const tickerItems = document.querySelectorAll('.ticker-item');
      tickerItems.forEach((item, index) => {
        const lot = this.catalog[index];
        if (lot) {
          const timeSpan = item.querySelector('.ticker-time');
          if (timeSpan) {
            timeSpan.innerHTML = `<i class="fa-regular fa-clock"></i> ${this.formatTime(lot.timeLeftSeconds)}`;
            if (lot.timeLeftSeconds < 180) {
              timeSpan.style.color = 'var(--accent-alert)';
              timeSpan.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }
          }
        }
      });

      // Update Active Arena Timer Display if Arena is loaded
      const currentLot = this.getCurrentLot();
      if (currentLot) {
        const arenaClock = document.getElementById('arena-big-timer');
        const timerWrapper = document.getElementById('arena-timer-wrapper');
        if (arenaClock) {
          arenaClock.textContent = this.formatTime(currentLot.timeLeftSeconds);
          if (currentLot.timeLeftSeconds <= 60 && currentLot.timeLeftSeconds > 0) {
            arenaClock.classList.add('danger');
            timerWrapper.classList.add('urgent');
            document.getElementById('arena-timer-subtext').textContent = '⚠️ FINAL 60 SECONDS - SNIPER GUARD ACTIVE';
          } else {
            arenaClock.classList.remove('danger');
            timerWrapper.classList.remove('urgent');
            document.getElementById('arena-timer-subtext').textContent = 'Live Floor Active';
          }
        }
      }

      // Update Homepage Lot of the Day Clock
      const lotOfDay = this.catalog.find(l => l.featuredLotOfDay) || this.catalog[0];
      const lodClock = document.getElementById('lot-of-the-day-clock');
      if (lodClock && lotOfDay) {
        lodClock.textContent = this.formatTime(lotOfDay.timeLeftSeconds);
        if (lotOfDay.timeLeftSeconds <= 60) lodClock.classList.add('ending-soon');
      }

      // Update Catalog Card Timers in DOM without re-rendering entire cards
      this.catalog.forEach(lot => {
        const cardTimer = document.getElementById(`card-timer-${lot.id}`);
        if (cardTimer) {
          cardTimer.textContent = this.formatTime(lot.timeLeftSeconds);
          if (lot.timeLeftSeconds <= 60) cardTimer.classList.add('ending-soon');
        }
      });

      // Escrow inspection decrement
      if (this.inspectionTimerSeconds > 0) {
        this.inspectionTimerSeconds--;
      }
    }, 1000);
  }

  formatTime(totalSeconds) {
    if (totalSeconds <= 0) return "00:00:00 (CLOSED)";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // =========================================================================
  // HOMEPAGE: LOT OF THE DAY & CATEGORIES
  // =========================================================================
  renderLotOfTheDay() {
    const container = document.getElementById('lot-of-the-day-container');
    if (!container) return;

    const lot = this.catalog.find(l => l.featuredLotOfDay) || this.catalog[0];

    container.innerHTML = `
      <div class="spotlight-ribbon">
        <div class="spotlight-tag">
          <i class="fa-solid fa-crown"></i> Lot of the Day
        </div>
        <div class="viewers-badge">
          <span class="live-dot"></span>
          <span>${lot.viewersCount} Collectors Watching</span>
        </div>
      </div>

      <div class="lot-visual-box" onclick="app.selectLotForArena('${lot.id}')" style="cursor: pointer;">
        <img src="${lot.image}" alt="${lot.title}">
        <div class="lot-countdown-overlay">
          <span class="countdown-label">Time Remaining</span>
          <div class="countdown-clock ${lot.timeLeftSeconds <= 60 ? 'ending-soon' : ''}" id="lot-of-the-day-clock">
            ${this.formatTime(lot.timeLeftSeconds)}
          </div>
        </div>
      </div>

      <div class="lot-title-group">
        <span class="card-cat-line">
          <span>${lot.category} &bull; ${lot.lotNumber}</span>
          <span class="text-gold-color"><i class="fa-solid fa-shield-check"></i> 100% Authenticated</span>
        </span>
        <h3>${lot.title}</h3>
        <p class="lot-submeta">${lot.subtitle}</p>
      </div>

      <div class="lot-bid-snapshot">
        <div>
          <span class="bid-lbl">Current Live Floor Bid</span>
          <div class="bid-val">$${lot.currentBid.toLocaleString()}</div>
        </div>
        <div style="text-align: right;">
          <span class="reserve-badge met"><i class="fa-solid fa-check"></i> Reserve Met</span>
          <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.25rem;">
            ${lot.bidsCount} verified bids placed
          </div>
        </div>
      </div>

      <div class="spotlight-actions">
        <button class="btn-enter-arena" onclick="app.selectLotForArena('${lot.id}')">
          <i class="fa-solid fa-gavel"></i> Bid in Live Arena
        </button>
        <button class="btn-inspect-quick" onclick="app.openCoaModal('${lot.id}')">
          <i class="fa-solid fa-certificate"></i> Inspect COA
        </button>
      </div>
    `;
  }

  renderCategoryPills() {
    const container = document.getElementById('category-filter-pills');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => `
      <button class="cat-pill ${this.activeCategory === cat.id ? 'active' : ''}" 
              onclick="app.filterCatalog('${cat.id}')">
        <i class="${cat.icon}"></i>
        <span>${cat.name}</span>
        <span class="cat-count">${cat.id === 'all' ? this.catalog.length : this.catalog.filter(l => l.categoryKey === cat.id).length}</span>
      </button>
    `).join('');
  }

  filterCatalog(catId) {
    this.activeCategory = catId;
    this.renderCategoryPills();
    this.renderCatalogGrid();
  }

  renderCatalogGrid() {
    const container = document.getElementById('auction-cards-grid');
    if (!container) return;

    const filtered = this.activeCategory === 'all' 
      ? this.catalog 
      : this.catalog.filter(l => l.categoryKey === this.activeCategory);

    container.innerHTML = filtered.map(lot => {
      const isFav = this.watchlist.has(lot.id);
      return `
        <div class="relic-card" id="card-${lot.id}">
          <div class="card-media-wrap">
            <img src="${lot.image}" alt="${lot.title}" loading="lazy">
            <div class="card-badge-top-left">
              <span class="live-dot" style="width: 6px; height: 6px;"></span>
              <span>${lot.lotNumber}</span>
            </div>
            <button class="card-watchlist-btn ${isFav ? 'favorited' : ''}" 
                    onclick="app.toggleWatchlist('${lot.id}', event)" 
                    title="Add to Watchlist">
              <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <div class="card-timer-ribbon">
              <div class="card-timer ${lot.timeLeftSeconds <= 60 ? 'ending-soon' : ''}">
                <i class="fa-regular fa-clock"></i>
                <span id="card-timer-${lot.id}">${this.formatTime(lot.timeLeftSeconds)}</span>
              </div>
              <span style="font-size: 0.72rem; color: var(--text-muted);"><i class="fa-solid fa-eye"></i> ${lot.viewersCount}</span>
            </div>
          </div>

          <div class="card-body">
            <div class="card-cat-line">
              <span>${lot.category}</span>
              <span style="color: var(--accent-live); font-size: 0.7rem;"><i class="fa-solid fa-check-circle"></i> Authenticated</span>
            </div>
            <h3 class="card-title">${lot.title}</h3>
            <p class="card-subtitle">${lot.subtitle}</p>

            <div class="card-pricing-row">
              <div class="card-price-block">
                <div class="lbl">Current Bid</div>
                <div class="amt" id="card-bid-${lot.id}">$${lot.currentBid.toLocaleString()}</div>
              </div>
              <div class="card-bids-stat">
                <span class="reserve-badge met">Reserve Met</span>
                <div style="margin-top: 0.2rem;" id="card-bids-count-${lot.id}">${lot.bidsCount} Bids</div>
              </div>
            </div>

            <div class="card-actions-row">
              <button class="btn-card-bid" onclick="app.selectLotForArena('${lot.id}')">
                <i class="fa-solid fa-gavel"></i> Live Bidding
              </button>
              <button class="btn-card-view" onclick="app.openCoaModal('${lot.id}')" title="Inspect Certificate">
                <i class="fa-solid fa-file-shield"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // VIEW 2: THE BIDDING ARENA LOGIC
  // =========================================================================
  selectLotForArena(lotId) {
    this.activeLotId = lotId;
    this.switchView('arena');
    this.renderArenaLot();
  }

  getCurrentLot() {
    return this.catalog.find(l => l.id === this.activeLotId) || this.catalog[0];
  }

  renderArenaLot() {
    const lot = this.getCurrentLot();
    if (!lot) return;

    // Breadcrumb & Badges
    document.getElementById('arena-current-lot-breadcrumb').textContent = `${lot.lotNumber} - ${lot.title}`;
    document.getElementById('arena-lot-badge').textContent = lot.lotNumber;
    document.getElementById('arena-viewers-count').textContent = `${lot.viewersCount} Viewing Now`;
    document.getElementById('arena-lot-title').textContent = lot.title;

    // Consignor chip
    document.getElementById('arena-seller-chip').innerHTML = `
      <div class="avatar-chip" style="background: ${lot.seller.avatarColor}; width: 22px; height: 22px; font-size: 0.65rem;">
        ${lot.seller.avatarInitials}
      </div>
      <span>Consignor: <strong>${lot.seller.name}</strong> (${lot.seller.handle})</span>
      <span class="kyc-verified-pill" style="padding: 0.1rem 0.4rem; font-size: 0.68rem;">
        <i class="fa-solid fa-check"></i> ${lot.seller.reputationScore}% Trust
      </span>
    `;

    // Visuals & Zoom
    const imgEl = document.getElementById('arena-main-image');
    imgEl.src = lot.highResImage;

    // Thumbnails strip
    const thumbsContainer = document.getElementById('arena-lot-thumbs');
    thumbsContainer.innerHTML = this.catalog.map(l => `
      <div class="lot-thumb-btn ${l.id === lot.id ? 'active' : ''}" 
           onclick="app.selectLotForArena('${l.id}')" title="${l.title}">
        <img src="${l.image}" alt="${l.title}">
      </div>
    `).join('');

    // Clock
    document.getElementById('arena-big-timer').textContent = this.formatTime(lot.timeLeftSeconds);

    // Current bid & increments
    this.updateArenaPricingDisplay(lot);

    // Quick-bid buttons
    this.renderQuickBidButtons(lot);

    // Proxy Status
    this.updateProxyUI(lot);

    // Provenance Tab Content
    document.getElementById('arena-provenance-timeline').innerHTML = lot.provenance.map(p => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-year">${p.year}</div>
        <div class="timeline-desc">${p.event}</div>
      </div>
    `).join('');

    // Expert Tab Content
    document.getElementById('arena-expert-content').innerHTML = `
      <div style="margin-bottom: 1.2rem;">
        <h5 style="font-size: 1.05rem; margin-bottom: 0.2rem; color: #fff;">Lead Appraiser Evaluation</h5>
        <div style="font-size: 0.84rem; color: var(--gold-light); margin-bottom: 0.8rem;">
          ${lot.authenticity.expert} &bull; ${lot.authenticity.expertTitle}
        </div>
        <p style="font-size: 0.88rem; line-height: 1.6; color: var(--text-muted); background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--gold-primary);">
          ${lot.curatorialNotes}
        </p>
      </div>
    `;
    document.getElementById('arena-cert-number-preview').textContent = `Serial: ${lot.authenticity.certNumber} • Hash: ${lot.authenticity.blockchainHash.slice(0, 16)}...`;

    // Specs Tab Content
    document.getElementById('arena-specs-content').innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        ${Object.entries(lot.specs).map(([key, val]) => `
          <div style="background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">${key}</div>
            <div style="font-size: 0.88rem; font-weight: 600; color: #fff; margin-top: 0.15rem;">${val}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Bid history entries
    this.renderBidHistory(lot);
  }

  updateArenaPricingDisplay(lot) {
    document.getElementById('arena-current-bid-display').textContent = `$${lot.currentBid.toLocaleString()}`;
    const minNext = lot.currentBid + lot.minIncrement;
    document.getElementById('arena-min-next-tag').textContent = `Min Next Bid: $${minNext.toLocaleString()}`;

    // Custom bid input placeholder
    const input = document.getElementById('arena-custom-bid-input');
    input.placeholder = `At least $${minNext.toLocaleString()}`;
    input.value = minNext;
    input.min = minNext;
  }

  renderQuickBidButtons(lot) {
    const container = document.getElementById('arena-quick-bid-buttons');
    if (!container) return;

    const increments = [
      lot.minIncrement,
      lot.minIncrement * 2,
      lot.minIncrement * 5,
      lot.minIncrement * 10
    ];

    container.innerHTML = increments.map(inc => {
      const targetAmount = lot.currentBid + inc;
      return `
        <button class="btn-quick-bid" onclick="app.placeQuickBid(${targetAmount})">
          + $${inc >= 1000 ? (inc/1000) + 'k' : inc}
          <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: normal;">$${(targetAmount/1000).toFixed(0)}k</div>
        </button>
      `;
    }).join('');
  }

  renderBidHistory(lot) {
    const container = document.getElementById('arena-bid-history-entries');
    const countEl = document.getElementById('arena-bid-history-count');
    if (!container) return;

    countEl.textContent = `${lot.bidHistory.length} Bids`;
    container.innerHTML = lot.bidHistory.map(b => `
      <div class="bid-log-entry ${b.isYou ? 'is-you' : ''}">
        <div class="bidder-info">
          <i class="fa-solid fa-user-shield" style="font-size: 0.75rem; color: ${b.isYou ? 'var(--accent-live)' : 'var(--gold-primary)'};"></i>
          <span class="bidder-name">${b.bidder} ${b.isYou ? '(You)' : ''}</span>
          ${b.verified ? '<i class="fa-solid fa-circle-check bidder-badge-check" title="Verified KYC"></i>' : ''}
          ${b.isProxy ? '<span style="font-size: 0.65rem; background: rgba(56, 189, 248, 0.2); color: var(--accent-blue); padding: 0.1rem 0.3rem; border-radius: 4px;">Proxy</span>' : ''}
        </div>
        <div style="text-align: right;">
          <div class="bid-entry-amount">$${b.amount.toLocaleString()}</div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">${b.time}</div>
        </div>
      </div>
    `).join('');
  }

  // =========================================================================
  // PLACING BIDS & ANTI-SNIPING PROTECTION ENGINE
  // =========================================================================
  placeQuickBid(amount) {
    document.getElementById('arena-custom-bid-input').value = amount;
    this.handlePlaceBid();
  }

  handlePlaceBid() {
    const lot = this.getCurrentLot();
    const input = document.getElementById('arena-custom-bid-input');
    const amount = parseInt(input.value, 10);

    const minRequired = lot.currentBid + lot.minIncrement;
    if (isNaN(amount) || amount < minRequired) {
      this.showToast(`Bid must be at least $${minRequired.toLocaleString()}`, 'error');
      return;
    }

    // Register User Bid
    this.executeBid(lot, "Lord Alistair (You)", amount, true);
    
    // Play celebratory audio
    audio.playGavel();
    audio.playBidPing();

    this.showToast(`Bid of $${amount.toLocaleString()} successfully recorded by floor clerk!`, 'success');

    // Trigger Anti-Sniping Check
    this.checkAntiSniping(lot, "You");
  }

  executeBid(lot, bidderName, amount, isYou = false, isProxy = false) {
    lot.currentBid = amount;
    lot.bidsCount++;
    lot.reserveMet = lot.currentBid >= lot.reservePrice;

    // Prepend to lot bid history
    lot.bidHistory.unshift({
      id: 'bid-' + Date.now(),
      bidder: bidderName,
      amount: amount,
      time: 'Just now',
      verified: true,
      isYou: isYou,
      isProxy: isProxy
    });

    // Update UI elements in arena
    if (lot.id === this.activeLotId) {
      this.updateArenaPricingDisplay(lot);
      this.renderQuickBidButtons(lot);
      this.renderBidHistory(lot);
    }

    // Update Homepage Card if rendered
    const cardBid = document.getElementById(`card-bid-${lot.id}`);
    const cardCount = document.getElementById(`card-bids-count-${lot.id}`);
    if (cardBid) cardBid.textContent = `$${amount.toLocaleString()}`;
    if (cardCount) cardCount.textContent = `${lot.bidsCount} Bids`;

    // Update Lot of the Day if it matches
    if (lot.featuredLotOfDay) {
      this.renderLotOfTheDay();
    }
  }

  // ANTI-SNIPING PROTECTION SYSTEM
  checkAntiSniping(lot, bidderName) {
    // If bid is placed within final 60 seconds, trigger Anti-Sniping Guard!
    if (lot.timeLeftSeconds <= 60 && lot.timeLeftSeconds > 0) {
      const addedSeconds = 120;
      lot.timeLeftSeconds += addedSeconds;
      lot.antiSnipingTriggered++;

      audio.playSniperGuardChime();

      // Update banner UI
      const banner = document.getElementById('anti-sniping-banner');
      banner.style.animation = 'none';
      void banner.offsetWidth; // trigger reflow
      banner.style.animation = 'banner-glow 1s infinite alternate';

      document.getElementById('sniper-banner-desc').innerHTML = `
        <span style="color: #ffd700; font-weight: 700;">
          ⚡ ANTI-SNIPING GUARD TRIGGERED! +${addedSeconds}s Added to Clock.
        </span> (Triggered by bid from ${bidderName} at final moments).
      `;

      this.showToast(`🛡️ Anti-Sniping Activated: +120s extended to ensure fair bidding!`, 'warning');

      // Append notice to live bid stream
      lot.bidHistory.unshift({
        id: 'anti-snipe-' + Date.now(),
        bidder: '⚡ ANTI-SNIPE GUARD',
        amount: lot.currentBid,
        time: '+120s Added',
        verified: true,
        isYou: false,
        isProxy: false
      });
      if (lot.id === this.activeLotId) this.renderBidHistory(lot);
    }
  }

  triggerSniperDemo() {
    const lot = this.getCurrentLot();
    // Set time to 25 seconds remaining to demonstrate immediate sniper protection
    lot.timeLeftSeconds = 25;
    this.showToast(`Clock fast-forwarded to 25s remaining. Placing sniper bid...`, 'info');

    setTimeout(() => {
      const simulatedSniper = "Highlander_Bot_09";
      const sniperBid = lot.currentBid + lot.minIncrement;
      this.executeBid(lot, simulatedSniper, sniperBid, false);
      this.checkAntiSniping(lot, simulatedSniper);
    }, 1200);
  }

  // =========================================================================
  // PROXY BIDDING (MAX AUTO-BIDDER)
  // =========================================================================
  setProxyBid() {
    const lot = this.getCurrentLot();
    const input = document.getElementById('arena-proxy-max-input');
    const maxAmount = parseInt(input.value, 10);

    const minRequired = lot.currentBid + lot.minIncrement * 2;
    if (isNaN(maxAmount) || maxAmount < minRequired) {
      this.showToast(`Max proxy ceiling must be at least $${minRequired.toLocaleString()}`, 'error');
      return;
    }

    this.proxyBids[lot.id] = maxAmount;
    this.updateProxyUI(lot);
    this.showToast(`Proxy Auto-Bidder active up to $${maxAmount.toLocaleString()}!`, 'success');
  }

  updateProxyUI(lot) {
    const statusPill = document.getElementById('proxy-status-pill');
    const maxVal = this.proxyBids[lot.id];
    if (maxVal && maxVal > lot.currentBid) {
      statusPill.textContent = `Active (Cap: $${maxVal.toLocaleString()})`;
      statusPill.className = 'badge-mini text-gold-color';
      statusPill.style.background = 'rgba(212, 175, 55, 0.2)';
    } else {
      statusPill.textContent = 'Inactive';
      statusPill.className = 'badge-mini text-muted';
      statusPill.style.background = 'transparent';
    }
  }

  // =========================================================================
  // SIMULATED COMPETING FLOOR BIDDERS LOOP
  // =========================================================================
  startFloorSimulationLoop() {
    const scheduleNextBid = () => {
      const delay = Math.floor(Math.random() * 8000) + 12000; // 12-20s interval
      this.simulationTimer = setTimeout(() => {
        if (this.simulationActive) {
          this.simulateCompetingBid();
        }
        scheduleNextBid();
      }, delay);
    };
    scheduleNextBid();
  }

  toggleFloorSimulation() {
    this.simulationActive = !this.simulationActive;
    const switchEl = document.getElementById('sim-floor-switch');
    if (this.simulationActive) {
      switchEl.classList.add('on');
      this.showToast("Floor Bidder Simulation: Enabled", "info");
    } else {
      switchEl.classList.remove('on');
      this.showToast("Floor Bidder Simulation: Paused", "info");
    }
  }

  simulateCompetingBid() {
    // Pick active lot: 70% chance it's the lot currently viewed in arena
    const currentLot = this.getCurrentLot();
    const activeLots = this.catalog.filter(l => l.timeLeftSeconds > 0);
    if (!activeLots.length) return;

    const lot = (Math.random() < 0.7 && currentLot.timeLeftSeconds > 0) 
      ? currentLot 
      : activeLots[Math.floor(Math.random() * activeLots.length)];

    const bidder = SIMULATED_BIDDERS[Math.floor(Math.random() * SIMULATED_BIDDERS.length)];
    const newAmount = lot.currentBid + lot.minIncrement;

    // Check if previous highest bidder was user
    const wasYouWinning = lot.bidHistory[0] && lot.bidHistory[0].isYou;

    // Execute floor bid
    this.executeBid(lot, bidder.name, newAmount, false);

    // If user was winning, outbid notification!
    if (wasYouWinning) {
      audio.playOutbidAlert();
      this.showToast(`⚠️ You were outbid by @${bidder.name} on ${lot.lotNumber} ($${newAmount.toLocaleString()})!`, 'outbid');
    }

    // Check anti-sniping
    this.checkAntiSniping(lot, bidder.name);

    // Check user's proxy auto-bidder response
    const proxyCeiling = this.proxyBids[lot.id];
    if (proxyCeiling && proxyCeiling >= (newAmount + lot.minIncrement)) {
      setTimeout(() => {
        const counterBid = newAmount + lot.minIncrement;
        this.executeBid(lot, "Lord Alistair (You)", counterBid, true, true);
        audio.playBidPing();
        this.showToast(`🤖 Proxy auto-bid placed: $${counterBid.toLocaleString()} on your behalf!`, 'success');
        this.checkAntiSniping(lot, "Your Proxy");
      }, 2000);
    }
  }

  handleAuctionEnded(lot) {
    audio.playGavel();
    const winningBid = lot.bidHistory[0];
    const winnerName = winningBid ? winningBid.bidder : "No Winner";
    this.showToast(`🔨 Gavel Fall! ${lot.lotNumber} officially CLOSED. Sold for $${lot.currentBid.toLocaleString()} to ${winnerName}!`, 'info');
  }

  // =========================================================================
  // ARENA INTERACTIVE TABS & OPTICAL ZOOM LENS
  // =========================================================================
  switchArenaTab(tabKey) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    event.currentTarget.classList.add('active');
    const targetPane = document.getElementById(`tab-pane-${tabKey}`);
    if (targetPane) targetPane.classList.add('active');
  }

  setupZoomLens() {
    const container = document.getElementById('arena-zoom-container');
    const lens = document.getElementById('arena-zoom-lens');
    const img = document.getElementById('arena-main-image');

    if (!container || !lens || !img) return;

    container.addEventListener('mouseenter', () => {
      lens.style.display = 'block';
      lens.style.backgroundImage = `url('${img.src}')`;
      lens.style.backgroundSize = `${img.width * 2.5}px ${img.height * 2.5}px`;
    });

    container.addEventListener('mouseleave', () => {
      lens.style.display = 'none';
    });

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Position lens
      lens.style.left = `${x}px`;
      lens.style.top = `${y}px`;

      // Calculate lens background offset
      const bgX = - (x * 2.5 - lens.offsetWidth / 2);
      const bgY = - (y * 2.5 - lens.offsetHeight / 2);
      lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
    });
  }

  // =========================================================================
  // VIEW 3: SELLER DASHBOARD & MULTI-STEP "LIST A TREASURE" WIZARD
  // =========================================================================
  switchSellerSubTab(tabName) {
    this.sellerSubTab = tabName;
    document.getElementById('seller-btn-wizard').classList.toggle('active', tabName === 'wizard');
    document.getElementById('seller-btn-tracker').classList.toggle('active', tabName === 'tracker');
    
    document.getElementById('seller-subtab-wizard').style.display = tabName === 'wizard' ? 'block' : 'none';
    document.getElementById('seller-subtab-tracker').style.display = tabName === 'tracker' ? 'grid' : 'none';

    if (tabName === 'tracker') {
      this.renderSellerTracker();
    }
  }

  openListingWizard() {
    this.switchView('seller');
    this.switchSellerSubTab('wizard');
  }

  nextWizardStep() {
    if (this.currentWizardStep < 4) {
      this.goToWizardStep(this.currentWizardStep + 1);
    }
  }

  prevWizardStep() {
    if (this.currentWizardStep > 1) {
      this.goToWizardStep(this.currentWizardStep - 1);
    }
  }

  goToWizardStep(stepNum) {
    this.currentWizardStep = stepNum;

    // Toggle form steps
    document.querySelectorAll('.wizard-form-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`wizard-step-${stepNum}`).classList.add('active');

    // Update Stepper circles
    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`step-node-${i}`);
      node.classList.remove('active', 'completed');
      if (i === stepNum) node.classList.add('active');
      else if (i < stepNum) node.classList.add('completed');
    }

    // Update buttons
    const prevBtn = document.getElementById('wiz-btn-prev');
    const nextBtn = document.getElementById('wiz-btn-next');
    const submitBtn = document.getElementById('wiz-btn-submit');

    prevBtn.style.visibility = stepNum > 1 ? 'visible' : 'hidden';
    if (stepNum === 4) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'flex';
      // Fill review summary
      document.getElementById('wiz-summary-title').textContent = document.getElementById('wiz-title').value;
      document.getElementById('wiz-summary-sub').textContent = `${document.getElementById('wiz-category').value} • ${document.getElementById('wiz-condition').value}`;
      document.getElementById('wiz-summary-prices').textContent = `$${parseInt(document.getElementById('wiz-start-bid').value).toLocaleString()} / $${parseInt(document.getElementById('wiz-reserve-bid').value).toLocaleString()}`;
    } else {
      nextBtn.style.display = 'flex';
      submitBtn.style.display = 'none';
    }
  }

  mockAddImage() {
    this.showToast("High-resolution artifact photograph uploaded & verified by Optical Hash engine!", "success");
    const container = document.getElementById('wiz-media-previews');
    const newThumb = document.createElement('div');
    newThumb.className = 'media-thumb-preview';
    newThumb.innerHTML = `<img src="assets/astrolabe.jpg" alt="Uploaded Artifact">`;
    container.appendChild(newThumb);
  }

  submitNewTreasure() {
    const title = document.getElementById('wiz-title').value || "Hellenistic Bronze Bust of Apollo";
    const category = document.getElementById('wiz-category').value;
    const startingBid = parseInt(document.getElementById('wiz-start-bid').value, 10) || 45000;
    const reservePrice = parseInt(document.getElementById('wiz-reserve-bid').value, 10) || 85000;
    const durationSec = parseInt(document.getElementById('wiz-duration').value, 10) || 432000;
    const provenanceText = document.getElementById('wiz-provenance').value;

    const newId = `lot-${Date.now()}`;
    const newLotNumber = `LOT #${String(88 + this.catalog.length).padStart(3, '0')}`;

    const newLot = {
      id: newId,
      lotNumber: newLotNumber,
      title: title,
      subtitle: `${document.getElementById('wiz-era').value} • ${document.getElementById('wiz-condition').value}`,
      category: category,
      categoryKey: "artifacts",
      image: "assets/astrolabe.jpg",
      highResImage: "assets/astrolabe.jpg",
      featuredLotOfDay: false,
      startingBid: startingBid,
      reservePrice: reservePrice,
      currentBid: startingBid,
      reserveMet: startingBid >= reservePrice,
      minIncrement: 2500,
      timeLeftSeconds: durationSec,
      initialDurationSeconds: durationSec,
      viewersCount: 48,
      bidsCount: 1,
      antiSnipingTriggered: 0,
      status: "active",
      seller: {
        name: "Lord Alistair Finch",
        handle: "@AlistairRelics",
        reputationScore: 99.8,
        verifiedKYC: true,
        tier: "Master Antiquarian",
        salesCompleted: 24,
        country: "London, UK",
        avatarInitials: "AF",
        avatarColor: "#10b981"
      },
      provenance: provenanceText.split('\n').filter(Boolean).map(line => {
        const parts = line.split(':');
        return { year: parts[0].trim(), event: (parts[1] || '').trim() };
      }),
      curatorialNotes: document.getElementById('wiz-description').value,
      authenticity: {
        expert: "Dr. Alistair Finch, FSA",
        expertTitle: "Senior Conservator, AuctionVault Authentication Council",
        certNumber: `AV-AUTH-2026-${newLotNumber.replace('#','')}`,
        issueDate: "October 19, 2026",
        blockchainHash: "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        inspectionStatus: "Physical Examination Passed (100% Guaranteed Authentic)"
      },
      specs: {
        "Period": document.getElementById('wiz-era').value,
        "Culture": document.getElementById('wiz-origin').value,
        "Condition": document.getElementById('wiz-condition').value,
        "Custody": "Vault Escrow Registered"
      },
      bidHistory: [
        { id: "b-init", bidder: "Initial Floor Consignor Offer", amount: startingBid, time: "Just now", verified: true, isYou: false }
      ]
    };

    // Prepend to catalog and seller consignments
    this.catalog.unshift(newLot);
    this.sellerConsignments.unshift(newLot);

    audio.playGavel();
    this.showToast(`🎉 ${title} has been minted & launched into the Live Floor Arena!`, 'success');

    // Update live catalog count & components
    document.getElementById('live-active-lots-count').textContent = `${this.catalog.length} Live`;
    this.renderCatalogGrid();
    this.renderTopTicker();
    this.selectLotForArena(newId);
  }

  renderSellerTracker() {
    const container = document.getElementById('seller-subtab-tracker');
    if (!container) return;

    container.innerHTML = this.sellerConsignments.map(lot => `
      <div class="seller-tracker-card">
        <div class="tracker-header">
          <img src="${lot.image}" alt="${lot.title}" class="tracker-img">
          <div class="tracker-lot-title">
            <span class="card-cat-line" style="margin-bottom: 0.2rem;">${lot.lotNumber} &bull; ${lot.category}</span>
            <h4>${lot.title}</h4>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Closes in: <span class="mono text-gold-color" id="tracker-timer-${lot.id}">${this.formatTime(lot.timeLeftSeconds)}</span>
            </div>
          </div>
        </div>

        <div class="tracker-meta-row">
          <div class="tracker-stat">
            <div class="t-lbl">Current Bid</div>
            <div class="t-val">$${lot.currentBid.toLocaleString()}</div>
          </div>
          <div class="tracker-stat">
            <div class="t-lbl">Reserve Status</div>
            <div style="font-size: 0.85rem; font-weight: 700; color: ${lot.reserveMet ? 'var(--accent-live)' : 'var(--accent-warning)'}; margin-top: 0.2rem;">
              ${lot.reserveMet ? 'Reserve Met' : 'Under Reserve'}
            </div>
          </div>
          <div class="tracker-stat">
            <div class="t-lbl">Live Spectators</div>
            <div class="t-val">${lot.viewersCount}</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.6rem;">
          <button class="btn-card-bid" style="flex: 1;" onclick="app.selectLotForArena('${lot.id}')">
            <i class="fa-solid fa-eye"></i> View Live Arena
          </button>
          <button class="btn-card-view" onclick="app.showToast('Consignor accepted highest bid for settlement escrow!', 'success')" title="Accept Current Bid">
            <i class="fa-solid fa-check"></i> Settle
          </button>
        </div>
      </div>
    `).join('');
  }

  // =========================================================================
  // VIEW 4: TRANSACTIONS, ESCROW GATEWAY & DIGITAL CERTIFICATES
  // =========================================================================
  renderCertificateVault() {
    const container = document.getElementById('certificate-vault-items');
    if (!container) return;

    container.innerHTML = this.catalog.slice(0, 4).map(lot => `
      <div class="certificate-passport-card">
        <div class="cert-crest-header">
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <div class="cert-seal"><i class="fa-solid fa-stamp"></i></div>
            <div>
              <h5 style="color: #fff; font-size: 0.98rem; font-family: var(--font-serif);">${lot.authenticity.certNumber}</h5>
              <div style="font-size: 0.74rem; color: var(--gold-light);">Issued: ${lot.authenticity.issueDate}</div>
            </div>
          </div>
          <span class="kyc-verified-pill" style="font-size: 0.7rem;">Verified Chain</span>
        </div>

        <h4 style="font-size: 1.15rem; margin-bottom: 0.4rem; color: #fff;">${lot.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">${lot.subtitle}</p>

        <div class="cert-hash-strip">
          <strong>SHA-256 Provenance Ledger:</strong><br>
          ${lot.authenticity.blockchainHash}
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1.2rem;">
          <span style="font-size: 0.78rem; color: var(--text-muted);">
            <i class="fa-solid fa-user-check"></i> ${lot.authenticity.expert}
          </span>
          <button class="btn-view-coa" onclick="app.openCoaModal('${lot.id}')">
            <i class="fa-solid fa-certificate"></i> Inspect COA
          </button>
        </div>
      </div>
    `).join('');
  }

  simulateEscrowRelease() {
    audio.playGavel();
    this.showToast("✅ Buyer inspection approved! $168,000 released from Escrow Custody to Consignor @StauffenAntiquities.", "success");
    setTimeout(() => {
      this.showToast("📜 Cryptographic Title Deed and Digital COA Passport transferred to your Collector Vault!", "info");
    }, 1500);
  }

  // =========================================================================
  // MODAL: PARCHMENT CERTIFICATE OF AUTHENTICITY (COA)
  // =========================================================================
  openCoaModal(lotId) {
    const lot = lotId ? this.catalog.find(l => l.id === lotId) : this.getCurrentLot();
    if (!lot) return;

    document.getElementById('coa-modal-lot-title').textContent = lot.title;
    document.getElementById('coa-modal-serial').textContent = `CERTIFICATE NO: ${lot.authenticity.certNumber} • ${lot.lotNumber}`;
    document.getElementById('coa-modal-hash').textContent = lot.authenticity.blockchainHash;
    document.getElementById('coa-modal-body-text').textContent = `
      This museum document certifies that '${lot.title}' (${lot.subtitle}) has undergone complete metallurgical, spectroscopic, and curatorial verification conducted by ${lot.authenticity.expert} (${lot.authenticity.expertTitle}). Thermoluminescence, XRF, and archival provenance audit records confirm 100% authenticity without reservations.
    `;

    document.getElementById('coa-modal').classList.add('open');
  }

  closeCoaModal() {
    document.getElementById('coa-modal').classList.remove('open');
  }

  // =========================================================================
  // WATCHLIST SYSTEM & LOCAL STORAGE
  // =========================================================================
  toggleWatchlist(lotId, event) {
    if (event) event.stopPropagation();

    if (this.watchlist.has(lotId)) {
      this.watchlist.delete(lotId);
      this.showToast("Removed relic from your watchlist", "info");
    } else {
      this.watchlist.add(lotId);
      this.showToast("⭐ Added relic to your active watchlist & bid alert notifications!", "success");
    }

    localStorage.setItem('av_watchlist', JSON.stringify([...this.watchlist]));
    this.updateWatchlistUI();
    this.renderCatalogGrid();
  }

  updateWatchlistUI() {
    const count = this.watchlist.size;
    const headerCount = document.getElementById('watchlist-header-count');
    if (headerCount) headerCount.textContent = count;
  }

  toggleWatchlistModal() {
    const modal = document.getElementById('watchlist-modal');
    if (modal.classList.contains('open')) {
      modal.classList.remove('open');
    } else {
      this.renderWatchlistModalItems();
      modal.classList.add('open');
    }
  }

  renderWatchlistModalItems() {
    const container = document.getElementById('watchlist-items-list');
    if (!container) return;

    const items = this.catalog.filter(l => this.watchlist.has(l.id));

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <i class="fa-regular fa-heart" style="font-size: 2.5rem; margin-bottom: 0.8rem; opacity: 0.5;"></i>
          <p>Your watchlist is currently empty. Click the heart icon on any treasure to track it in real time!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(lot => `
      <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.8rem 1rem; gap: 1rem;">
        <img src="${lot.image}" alt="${lot.title}" style="width: 55px; height: 55px; border-radius: 6px; object-fit: cover;">
        <div style="flex: 1;">
          <h5 style="font-size: 0.95rem; color: #fff; margin-bottom: 0.2rem;">${lot.title}</h5>
          <div style="font-size: 0.78rem; color: var(--gold-light); font-family: var(--font-mono);">
            Current: $${lot.currentBid.toLocaleString()} &bull; <span class="text-danger">${this.formatTime(lot.timeLeftSeconds)}</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn-card-bid" onclick="app.selectLotForArena('${lot.id}'); app.toggleWatchlistModal();">
            <i class="fa-solid fa-gavel"></i>
          </button>
          <button class="btn-card-view" onclick="app.toggleWatchlist('${lot.id}')" title="Remove">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // =========================================================================
  // AUDIO TOGGLE & WEB AUDIO
  // =========================================================================
  setupAudioToggle() {
    const btn = document.getElementById('audio-toggle-btn');
    const icon = document.getElementById('audio-icon');
    const label = document.getElementById('audio-label');

    const updateAudioBtnUI = () => {
      const isMuted = audio.isMuted();
      if (isMuted) {
        btn.classList.remove('active');
        icon.className = 'fa-solid fa-volume-xmark';
        label.textContent = 'FX Muted';
      } else {
        btn.classList.add('active');
        icon.className = 'fa-solid fa-volume-high';
        label.textContent = 'FX On';
      }
    };

    updateAudioBtnUI();

    btn.addEventListener('click', () => {
      const muted = audio.toggleMute();
      updateAudioBtnUI();
      if (!muted) {
        audio.playBidPing();
        this.showToast("Sound effects enabled (Gavel, Bid Chimes, Alerts)", "info");
      } else {
        this.showToast("Sound effects muted", "info");
      }
    });
  }

  // =========================================================================
  // TOAST NOTIFICATIONS SYSTEM
  // =========================================================================
  showToast(message, type = 'info') {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    let title = 'Auction Update';

    if (type === 'outbid') {
      iconClass = 'fa-solid fa-triangle-exclamation';
      title = 'Outbid Notice';
    } else if (type === 'success') {
      iconClass = 'fa-solid fa-circle-check';
      title = 'Action Confirmed';
    } else if (type === 'warning') {
      iconClass = 'fa-solid fa-shield-virus';
      title = 'Anti-Sniping Protocol';
    }

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.8rem;">
        <i class="${iconClass}" style="font-size: 1.2rem; color: ${type === 'outbid' ? 'var(--accent-alert)' : type === 'success' ? 'var(--accent-live)' : 'var(--gold-primary)'}"></i>
        <div class="toast-text">
          <h6>${title}</h6>
          <p>${message}</p>
        </div>
      </div>
      <button style="background: none; border: none; color: var(--text-muted); cursor: pointer;" onclick="this.parentElement.remove()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    stack.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
}

// Instantiate and launch when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const application = new AuctionVaultApp();
  application.init();
});

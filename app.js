(() => {
  const STORE_KEY = "simple-contract-system-v1";
  const CHANNEL_NAME = "simple-contract-system-sync-v1";
  const INSTANCE_ID = randomToken(8);
  const channel = createChannel();

  const STATUS = {
    draft: { label: "草稿", className: "" },
    published: { label: "已发布", className: "status-published" },
    confirmed: { label: "乙方已确认", className: "status-confirmed" },
    signed: { label: "乙方已签署", className: "status-signed" },
    revoked: { label: "已撤回", className: "status-revoked" },
  };

  const FIELD_GROUPS = [
    {
      title: "合作内容",
      fields: [
        { key: "brand", label: "品牌", required: true },
        { key: "platformAccount", label: "平台账号", required: true },
        { key: "creatorName", label: "博主名称", required: true },
        { key: "partyBPhone", label: "乙方联系电话", required: true },
        {
          key: "sampleShippingInfo",
          label: "寄样信息（是否寄样）",
          type: "select",
          options: ["已寄样", "未寄样"],
          required: true,
        },
        { key: "firstReviewDate", label: "初稿时间", type: "date", required: true },
        { key: "finalReviewDate", label: "终稿时间", type: "date", required: true },
        { key: "publishDate", label: "发布时间", type: "date", required: true },
        {
          key: "retentionDate",
          label: "保留时间",
          type: "date-or-long-term",
          required: true,
        },
        { key: "partyAProvided", label: "甲方提供", type: "textarea", wide: true },
      ],
    },
    {
      title: "费用结算",
      fields: [
        { key: "price", label: "价格", type: "number", required: true },
        { key: "amountUpper", label: "金额大写", readonly: true },
      ],
    },
    {
      title: "甲方签署",
      fields: [
        { key: "partyASignDate", label: "甲方日期", type: "date" },
        { key: "partyASignature", label: "签名图片", type: "file", accept: "image/*" },
        { key: "partyASignature", label: "手写签名", type: "signature" },
      ],
    },
  ];

  const DEFAULT_CLAUSES = [
    {
      title: "三、权利义务",
      body: [
        "甲方应按约定向乙方提供合作需求、审核意见和必要资料，并保证其提供内容合法合规。",
        "乙方应按约定完成内容制作、审核修改、发布和保留，不得擅自删除、隐藏或设置为私密。",
        "乙方应保证交付内容不侵犯第三方合法权益，并对合作过程中知悉的未公开信息承担保密义务。",
      ],
    },
    {
      title: "四、违约责任",
      body: [
        "任一方违反本协议约定，应赔偿守约方因此遭受的实际损失。",
        "乙方逾期发布或发布内容不符合确认稿的，甲方有权要求限期改正、补发或按比例退款。",
        "因任一方原因造成第三方索赔的，由责任方自行承担相关责任。",
      ],
    },
    {
      title: "五、争议解决",
      body: [
        "本协议适用中华人民共和国法律。",
        "因本协议产生的争议，双方应友好协商解决；协商不成的，任一方可向履约方所在地人民法院提起诉讼。",
      ],
    },
    {
      title: "六、协议生效",
      body: [
        "本协议自双方签字或盖章之日起生效。",
        "本协议发布后绑定当前字段和条款版本快照，后续模板修改不影响已发布合同。",
      ],
    },
  ];

  const DEFAULT_FIELDS = {
    brand: "Wlead",
    platformAccount: "小红书 / @creator",
    creatorName: "一只允沫",
    partyBPhone: "13800000000",
    sampleShippingInfo: "未寄样",
    firstReviewDate: "2026-04-25",
    finalReviewDate: "2026-04-27",
    publishDate: "2026-04-30",
    retentionDate: "2026-07-30",
    partyAProvided: "品牌资料、拍摄要求、审核反馈、禁用词和发布注意事项。",
    price: "300",
    amountUpper: "人民币叁佰元整",
    partyASignDate: "",
    partyASignature: "",
  };

  let store = loadStore();
  let activeView = "editor";
  let signerToken = "";
  let signatureDirty = false;
  let canvasReady = false;
  let resizeSignatureCanvas = () => {};

  init();

  function init() {
    bindEvents();
    parseHashRoute();
    renderAll();
    setupSignatureCanvas();
    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.from === INSTANCE_ID) return;
        store = loadStore();
        renderAll();
      };
    }
    window.addEventListener("storage", (event) => {
      if (event.key === STORE_KEY) {
        store = loadStore();
        renderAll();
      }
    });
    window.addEventListener("hashchange", () => {
      parseHashRoute();
      renderAll();
    });
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("exporting-pdf");
      document.getElementById("printRoot").setAttribute("aria-hidden", "true");
      document.getElementById("printRoot").innerHTML = "";
    });
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        activeView = button.dataset.view;
        if (activeView !== "signer" && location.hash.startsWith("#sign=")) {
          history.replaceState(null, "", location.pathname + location.search);
          signerToken = "";
        }
        renderAll();
      });
    });

    document.getElementById("newBtn").addEventListener("click", createContract);
    document.getElementById("saveBtn").addEventListener("click", saveCurrentDraft);
    document.getElementById("publishBtn").addEventListener("click", publishContract);
    document.getElementById("revokeBtn").addEventListener("click", revokeContract);
    document.getElementById("printBtn").addEventListener("click", printCurrentContract);
    document.getElementById("signerPrintBtn").addEventListener("click", printCurrentContract);
    document.getElementById("copyLinkBtn").addEventListener("click", copyShareLink);
    document.getElementById("saveClauseVersionBtn").addEventListener("click", saveClauseVersion);
    document.getElementById("clearSignBtn").addEventListener("click", () => clearSignatureCanvas(true));
    document.getElementById("submitSignBtn").addEventListener("click", submitSignature);
    document.getElementById("confirmCheckbox").addEventListener("change", confirmSigner);
    document.getElementById("contractForm").addEventListener("input", handleFieldInput);
    document.getElementById("contractForm").addEventListener("change", handleFieldChange);
    document.getElementById("contractList").addEventListener("click", selectContractFromList);
    document.getElementById("searchInput").addEventListener("input", renderContractList);
  }

  function renderAll() {
    renderTabs();
    renderContractList();
    renderMonthlyStats();
    renderForm();
    renderPreview();
    renderSigner();
    renderClauses();
    renderTopState();
  }

  function renderTabs() {
    document.body.classList.toggle("signer-portal", Boolean(signerToken));
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === activeView);
    });
    document.querySelectorAll(".view-panel").forEach((panel) => {
      panel.classList.toggle("is-active", panel.id === `${activeView}View`);
    });
  }

  function renderContractList() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const list = document.getElementById("contractList");
    const items = store.contracts.filter((contract) => {
      const text = [contract.fields.brand, contract.fields.creatorName, contract.fields.platformAccount, contract.fields.partyBPhone]
        .join(" ")
        .toLowerCase();
      return !query || text.includes(query);
    });
    document.getElementById("contractCount").textContent = String(store.contracts.length);
    list.innerHTML = items
      .map((contract) => {
        const status = STATUS[contract.status] || STATUS.draft;
        return `
          <button class="contract-item${contract.id === store.selectedId ? " is-active" : ""}" type="button" data-contract-id="${escapeAttr(contract.id)}">
            <span class="contract-item-main">
              <strong>${escapeHtml(contract.fields.brand || "未命名合同")}</strong>
              <span>${escapeHtml(contract.fields.creatorName || "-")} · ${escapeHtml(contract.fields.platformAccount || "-")}</span>
              <em class="status-pill ${status.className}">${status.label}</em>
            </span>
            <span class="delete-contract-button" data-delete-contract-id="${escapeAttr(contract.id)}" title="删除合同">删除</span>
          </button>
        `;
      })
      .join("");
  }

  function renderMonthlyStats() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthContracts = store.contracts.filter((contract) => String(contract.createdAt || "").startsWith(month));
    const amount = monthContracts.reduce((sum, contract) => sum + Number(contract.fields.price || 0), 0);
    document.getElementById("monthCount").textContent = String(monthContracts.length);
    document.getElementById("monthAmount").textContent = formatMoney(amount);
    document.getElementById("signedCount").textContent = String(monthContracts.filter((contract) => contract.status === "signed").length);
  }

  function renderForm() {
    const contract = currentContract();
    const form = document.getElementById("contractForm");
    if (!contract) {
      document.getElementById("contractPreview").innerHTML = "";
      return;
    }
    document.getElementById("contractPreview").innerHTML = renderEditableContractDocument(contract);
    setupPartyASignatureCanvas();
  }

  function renderField(contract, field, locked) {
    return `
      <label class="field${field.wide ? " is-wide" : ""}">
        <span>${field.label}${field.required ? '<i class="required">*</i>' : ""}</span>
        ${renderFieldControl(contract, field, locked)}
      </label>
    `;
  }

  function renderFieldControl(contract, field, locked) {
    const value = contract.fields[field.key] || "";
    const disabled = locked || field.readonly ? "disabled" : "";
    if (field.type === "file") {
      const preview = value ? `<img class="upload-preview" src="${escapeAttr(value)}" alt="甲方签名预览" />` : `<em class="upload-empty">未上传</em>`;
      return `
        <div class="upload-field">
          <input data-field-key="${field.key}" type="file" accept="${escapeAttr(field.accept || "image/*")}" ${disabled} />
          ${preview}
        </div>
      `;
    }
    if (field.type === "signature") {
      const disabledAttr = locked ? "disabled" : "";
      return `
        <div class="party-a-sign-pad">
          <canvas id="partyASignatureCanvas" aria-label="甲方手写签名"></canvas>
        </div>
        <div class="signature-tools">
          <button class="ghost-button" id="clearPartyASignBtn" type="button" ${disabledAttr}>清除手写</button>
          <button class="ghost-button" id="savePartyASignBtn" type="button" ${disabledAttr}>保存为甲方签名</button>
        </div>
      `;
    }
    if (field.type === "textarea") {
      return `
        <textarea data-field-key="${field.key}" ${disabled}>${escapeHtml(value)}</textarea>
      `;
    }
    if (field.type === "select") {
      const options = (field.options || []).map((option) => {
        const selected = String(option) === String(value) ? "selected" : "";
        return `<option value="${escapeAttr(option)}" ${selected}>${escapeHtml(option)}</option>`;
      }).join("");
      return `<select data-field-key="${field.key}" ${disabled}>${options}</select>`;
    }
    if (field.type === "date-or-long-term") {
      const isLongTerm = value === "长期";
      return `
        <div class="retention-control">
          <input data-field-key="${field.key}" type="date" value="${isLongTerm ? "" : escapeAttr(value)}" ${disabled} />
          <label class="inline-check">
            <input data-field-key="${field.key}" data-retention-long-term="true" type="checkbox" ${isLongTerm ? "checked" : ""} ${disabled} />
            <span>长期</span>
          </label>
        </div>
      `;
    }
    return `
      <input data-field-key="${field.key}" type="${field.type || "text"}" value="${escapeAttr(value)}" ${disabled} />
    `;
  }

  function renderPreview() {
    const contract = currentContract();
    if (!contract) return;
    const status = STATUS[contract.status] || STATUS.draft;
    document.getElementById("previewMeta").textContent = `${status.label} · ${contract.fields.brand || "未命名合同"}`;
    if (document.activeElement?.closest("#contractForm")) return;
    document.getElementById("contractPreview").innerHTML = renderEditableContractDocument(contract);
    setupPartyASignatureCanvas();
    document.getElementById("publishBtn").disabled = contract.status !== "draft";
    document.getElementById("revokeBtn").disabled = !["published", "confirmed"].includes(contract.status);
    const shareBox = document.getElementById("shareBox");
    if (["published", "confirmed", "signed"].includes(contract.status)) {
      shareBox.hidden = false;
      document.getElementById("shareLink").value = buildSignLink(contract);
    } else {
      shareBox.hidden = true;
    }
  }

  function renderSigner() {
    const contract = signerContract();
    const status = document.getElementById("signerStatus");
    const preview = document.getElementById("signerPreview");
    const meta = document.getElementById("signerMeta");
    const canSign = contract && ["published", "confirmed"].includes(contract.status);
    if (!contract) {
      status.textContent = "暂无可签署合同。请先由甲方发布合同，或打开乙方签署链接。";
      preview.innerHTML = "";
      meta.textContent = "待发布";
    } else {
      const statusInfo = STATUS[contract.status] || STATUS.draft;
      status.textContent = `当前状态：${statusInfo.label}`;
      preview.innerHTML = renderContractDocument(contract);
      meta.textContent = `${statusInfo.label} · ${contract.fields.brand || "未命名合同"}`;
    }
    document.getElementById("signerName").disabled = !canSign;
    document.getElementById("confirmCheckbox").disabled = !canSign;
    document.getElementById("submitSignBtn").disabled = !canSign;
    document.getElementById("clearSignBtn").disabled = !canSign;
    document.getElementById("signerPrintBtn").disabled = !contract;
    resizeSignatureCanvas();
  }

  function renderClauses() {
    const version = activeClauseVersion();
    document.getElementById("clauseMeta").textContent = `${version.version} · ${formatDateTime(version.updatedAt)} · ${version.maintainer}`;
    document.getElementById("clauseList").innerHTML = version.sections.map((clause, index) => `
      <article class="clause-item">
        <label class="field is-wide">
          <span>条款标题</span>
          <input data-clause-index="${index}" data-clause-field="title" type="text" value="${escapeAttr(clause.title)}" />
        </label>
        <label class="field is-wide">
          <span>条款内容</span>
          <textarea class="clause-textarea" data-clause-index="${index}" data-clause-field="body">${escapeHtml(clause.body.join("\n"))}</textarea>
        </label>
      </article>
    `).join("");
  }

  function saveClauseVersion() {
    const blocks = Array.from(document.querySelectorAll(".clause-item"));
    const sections = blocks.map((block, index) => {
      const title = block.querySelector('[data-clause-field="title"]')?.value.trim() || `条款 ${index + 1}`;
      const bodyText = block.querySelector('[data-clause-field="body"]')?.value || "";
      const body = bodyText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
      return { title, body: body.length ? body : ["请填写条款内容。"] };
    });
    const previous = activeClauseVersion();
    const next = {
      id: randomToken(12),
      version: bumpClauseVersion(previous.version),
      maintainer: "甲方",
      updatedAt: nowIso(),
      sections,
    };
    store.clauseVersions.push(next);
    store.activeClauseVersionId = next.id;
    saveStore(true);
    renderAll();
    document.getElementById("syncState").textContent = `已保存条款 ${next.version}`;
  }

  function renderTopState() {
    const contract = currentContract();
    const status = contract ? STATUS[contract.status]?.label || "草稿" : "无合同";
    document.getElementById("syncState").textContent = `本地已同步 · ${status}`;
  }

  function renderEditableContractDocument(contract) {
    if (contract.status !== "draft") return renderContractDocument(contract);
    const fields = contract.fields;
    const clauses = activeClauseVersion().sections;
    const editable = (key) => renderInlineField(contract, fieldConfig(key), false);
    return `
      <article class="contract-document editable-contract">
        <section class="contract-page">
          <h1 class="doc-title">达人内容发布合作协议</h1>
          <section class="editable-block">
            <h3>一、合作内容</h3>
            <div class="embedded-grid two-col">
              ${editable("brand")}
              ${editable("creatorName")}
              ${editable("platformAccount")}
              ${editable("partyBPhone")}
              ${editable("sampleShippingInfo")}
              ${editable("firstReviewDate")}
              ${editable("finalReviewDate")}
              ${editable("publishDate")}
              ${editable("retentionDate")}
            </div>
            ${editable("partyAProvided")}
          </section>
          <section class="editable-block">
            <h3>二、费用结算</h3>
            <div class="embedded-grid two-col">
              ${editable("price")}
              ${editable("amountUpper")}
            </div>
          </section>
          ${clauses.map(renderClauseSection).join("")}
          <section class="editable-block signature-edit-block">
            <h3>甲方签署</h3>
            <div class="embedded-grid two-col">
              ${editable("partyASignDate")}
              ${editable("partyASignature")}
            </div>
            ${editable("partyASignaturePad")}
          </section>
          ${renderSignatureBlock(contract, fields)}
        </section>
      </article>
    `;
  }

  function fieldConfig(key) {
    const aliases = {
      partyASignaturePad: { key: "partyASignature", label: "手写签名", type: "signature" },
    };
    if (aliases[key]) return aliases[key];
    return FIELD_GROUPS.flatMap((group) => group.fields).find((field) => field.key === key) || { key, label: key };
  }

  function renderInlineField(contract, field, locked) {
    return `<div class="embedded-field${field.wide || field.type === "textarea" || field.type === "signature" ? " is-wide" : ""}">
      <span class="embedded-label">${field.label}${field.required ? '<i class="required">*</i>' : ""}</span>
      ${renderFieldControl(contract, field, locked)}
    </div>`;
  }

  function renderContractDocument(contract) {
    const fields = renderFields(contract);
    const clauses = renderClausesForContract(contract);
    return `
      <article class="contract-document">
        <section class="contract-page">
          <h1 class="doc-title">达人内容发布合作协议</h1>
          <section class="doc-section">
            <h3>一、合作内容</h3>
            <table class="info-table">
              <tr><th>品牌</th><td>${escapeHtml(fields.brand || "-")}</td><th>博主名称</th><td>${escapeHtml(fields.creatorName || "-")}</td></tr>
              <tr><th>平台账号</th><td colspan="3">${escapeHtml(fields.platformAccount || "-")}</td></tr>
              <tr><th>联系电话</th><td>${escapeHtml(fields.partyBPhone || "-")}</td><th>寄样信息</th><td>${escapeHtml(fields.sampleShippingInfo || "-")}</td></tr>
              <tr><th>初稿时间</th><td>${escapeHtml(formatDateCn(fields.firstReviewDate || fields.reviewDate) || "-")}</td><th>终稿时间</th><td>${escapeHtml(formatDateCn(fields.finalReviewDate || fields.reviewDate) || "-")}</td></tr>
              <tr><th>发布时间</th><td>${escapeHtml(formatDateCn(fields.publishDate) || "-")}</td><th>保留时间</th><td>${escapeHtml(formatRetentionDate(fields.retentionDate || fields.retentionPeriod) || "-")}</td></tr>
              <tr><th>甲方提供</th><td colspan="3">${escapeHtml(fields.partyAProvided || "-")}</td></tr>
            </table>
          </section>
          <section class="doc-section">
            <h3>二、费用结算</h3>
            <table class="info-table">
              <tr><th>价格</th><td>${escapeHtml(formatMoney(fields.price))}</td><th>金额大写</th><td>${escapeHtml(fields.amountUpper || "-")}</td></tr>
            </table>
          </section>
          ${clauses.map(renderClauseSection).join("")}
          ${renderSignatureBlock(contract, fields)}
        </section>
      </article>
    `;
  }

  function renderClauseSection(clause) {
    return `
      <section class="doc-section">
        <h3>${escapeHtml(clause.title)}</h3>
        ${clause.body.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </section>
    `;
  }

  function renderSignatureBlock(contract, fields) {
    const signature = contract.signature || {};
    const partyASignature = fields.partyASignature ? `<img src="${escapeAttr(fields.partyASignature)}" alt="甲方签名" />` : "";
    const partyADate = fields.partyASignDate ? formatDateCn(fields.partyASignDate) : "";
    const signImage = signature.imageData ? `<img src="${escapeAttr(signature.imageData)}" alt="乙方签名" />` : "";
    const signDate = signature.signedAt ? formatDateCn(signature.signedAt.slice(0, 10)) : "";
    const finalMeta = signature.snapshotHash ? `<div class="final-meta">合同快照：${escapeHtml(signature.snapshotHash)}</div>` : "";
    return `
      <div class="signature-grid">
        <div class="signature-col">
          <p>甲方（签字/盖章）：</p>
          <span class="signature-line">${partyASignature}</span>
          <p>日期：</p>
          <div class="date-line"><span></span><strong>${escapeHtml(partyADate)}</strong></div>
        </div>
        <div class="signature-col">
          <p>乙方（签字）：</p>
          <span class="signature-line">${signImage}</span>
          <p>签署人：${escapeHtml(signature.signerName || "")}</p>
          <div class="date-line"><span>日期：</span><strong>${escapeHtml(signDate)}</strong></div>
        </div>
      </div>
      ${finalMeta}
    `;
  }

  function handleFieldInput(event) {
    const key = event.target.dataset.fieldKey;
    if (!key) return;
    if (event.target.type === "file") return;
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    if (event.target.dataset.retentionLongTerm === "true") {
      contract.fields[key] = event.target.checked ? "长期" : "";
      const dateInput = event.target.closest(".retention-control")?.querySelector('input[type="date"]');
      if (dateInput) dateInput.disabled = event.target.checked;
    } else {
      contract.fields[key] = event.target.value;
    }
    if (key === "price") {
      contract.fields.amountUpper = moneyToChinese(event.target.value);
      const amountUpperInput = document.querySelector('[data-field-key="amountUpper"]');
      if (amountUpperInput) amountUpperInput.value = contract.fields.amountUpper;
    }
    contract.updatedAt = nowIso();
    saveStore(true);
    renderContractList();
    renderMonthlyStats();
  }

  function handleFieldChange(event) {
    const key = event.target.dataset.fieldKey;
    if (!key) return;
    if (event.target.type !== "file") {
      handleFieldInput(event);
      return;
    }
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showValidation(["请上传图片格式的甲方签名。"]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      contract.fields[key] = reader.result;
      contract.updatedAt = nowIso();
      saveStore(true);
      showValidation([]);
      renderForm();
    };
    reader.readAsDataURL(file);
  }

  function createContract() {
    const contract = makeContract();
    store.contracts.unshift(contract);
    store.selectedId = contract.id;
    activeView = "editor";
    saveStore(true);
    renderAll();
  }

  function saveCurrentDraft() {
    const contract = currentContract();
    if (!contract) return;
    contract.updatedAt = nowIso();
    saveStore(true);
    showValidation([]);
    renderForm();
    renderPreview();
  }

  function publishContract() {
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    const errors = validateContract(contract);
    if (errors.length) {
      showValidation(errors);
      return;
    }
    contract.status = "published";
    contract.publishedAt = nowIso();
    contract.token = contract.token || randomToken(18);
    contract.snapshot = {
      fields: clone(contract.fields),
      clauses: clone(activeClauseVersion().sections),
      clauseVersion: activeClauseVersion().version,
      publishedAt: contract.publishedAt,
    };
    contract.audit.push(makeAudit("发布合同", "生成乙方签署链接并锁定合同快照"));
    saveStore(true);
    showValidation([]);
    renderAll();
  }

  function revokeContract() {
    const contract = currentContract();
    if (!contract || !["published", "confirmed"].includes(contract.status)) return;
    contract.status = "revoked";
    contract.audit.push(makeAudit("撤回合同", "乙方签署链接失效"));
    saveStore(true);
    renderAll();
  }

  function confirmSigner() {
    const contract = signerContract();
    const checked = document.getElementById("confirmCheckbox").checked;
    if (!contract || !checked || contract.status !== "published") return;
    contract.status = "confirmed";
    contract.confirmedAt = nowIso();
    contract.audit.push(makeAudit("乙方确认", "乙方勾选已确认合同内容无误"));
    saveStore(true);
    renderAll();
  }

  async function submitSignature() {
    const contract = signerContract();
    const signerName = document.getElementById("signerName").value.trim();
    const confirmed = document.getElementById("confirmCheckbox").checked;
    if (!contract || !["published", "confirmed"].includes(contract.status)) {
      showSignMessage("当前合同不可签署。");
      return;
    }
    if (!confirmed) {
      showSignMessage("请先勾选已确认合同内容无误。");
      return;
    }
    if (!signerName) {
      showSignMessage("请输入签署人姓名。");
      return;
    }
    if (!signatureDirty) {
      showSignMessage("请先在签名区域手写签名。");
      return;
    }
    const canvas = document.getElementById("signatureCanvas");
    const signature = {
      signerName,
      imageData: canvas.toDataURL("image/png"),
      confirmedAt: contract.confirmedAt || nowIso(),
      signedAt: nowIso(),
      userAgent: navigator.userAgent,
    };
    signature.snapshotHash = await makeSnapshotHash(contract.snapshot || { fields: contract.fields, clauses: activeClauseVersion().sections }, signature);
    contract.status = "signed";
    contract.signedAt = signature.signedAt;
    contract.signature = signature;
    contract.audit.push(makeAudit("乙方签署", `${signerName} 完成电子手写签名`));
    saveStore(true);
    showSignMessage("签署已提交，甲方页面已同步。", "ok");
    renderAll();
  }

  function selectContractFromList(event) {
    const deleteButton = event.target.closest("[data-delete-contract-id]");
    if (deleteButton) {
      deleteContract(deleteButton.dataset.deleteContractId);
      return;
    }
    const item = event.target.closest("[data-contract-id]");
    if (!item) return;
    store.selectedId = item.dataset.contractId;
    activeView = "editor";
    signerToken = "";
    if (location.hash.startsWith("#sign=")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    saveStore(false);
    renderAll();
  }

  function deleteContract(contractId) {
    const contract = store.contracts.find((item) => item.id === contractId);
    if (!contract) return;
    const ok = window.confirm(`确定删除合同「${contract.fields.brand || contract.fields.creatorName || "未命名合同"}」？`);
    if (!ok) return;
    store.contracts = store.contracts.filter((item) => item.id !== contractId);
    if (!store.contracts.length) {
      const next = makeContract();
      store.contracts = [next];
      store.selectedId = next.id;
    } else if (store.selectedId === contractId) {
      store.selectedId = store.contracts[0].id;
    }
    saveStore(true);
    renderAll();
  }

  function printCurrentContract() {
    const contract = activeView === "signer" ? signerContract() : currentContract();
    if (!contract) return;
    const printRoot = document.getElementById("printRoot");
    printRoot.innerHTML = renderContractDocument(contract);
    printRoot.setAttribute("aria-hidden", "false");
    document.body.classList.add("exporting-pdf");
    document.title = `${contract.fields.brand || "合同"}_${contract.fields.creatorName || ""}`;
    requestAnimationFrame(() => {
      setTimeout(() => window.print(), 80);
    });
  }

  async function copyShareLink() {
    const value = document.getElementById("shareLink").value;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      document.getElementById("syncState").textContent = "签署链接已复制";
    } catch (error) {
      document.getElementById("shareLink").select();
    }
  }

  function showValidation(errors) {
    const box = document.getElementById("validationBox");
    if (!errors.length) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.hidden = false;
    box.innerHTML = errors.map((error) => `<div>${escapeHtml(error)}</div>`).join("");
  }

  function showSignMessage(message, tone = "warn") {
    const box = document.getElementById("signMessage");
    box.hidden = false;
    box.textContent = message;
    box.style.background = tone === "ok" ? "#eaf7ef" : "#fff7e7";
    box.style.color = tone === "ok" ? "#237044" : "#83540f";
  }

  function validateContract(contract) {
    const errors = [];
    FIELD_GROUPS.forEach((group) => {
      group.fields.forEach((field) => {
        if (!field.required) return;
        if (!String(contract.fields[field.key] || "").trim()) {
          errors.push(`${field.label}不能为空`);
        }
      });
    });
    if (Number(contract.fields.price) <= 0) errors.push("价格必须大于 0");
    return errors;
  }

  function setupSignatureCanvas() {
    const canvas = document.getElementById("signatureCanvas");
    const context = canvas.getContext("2d");
    let drawing = false;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ratio = window.devicePixelRatio || 1;
      const previous = signatureDirty ? canvas.toDataURL("image/png") : "";
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 2.2;
      context.strokeStyle = "#111";
      if (previous) {
        const image = new Image();
        image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
        image.src = previous;
      }
      canvasReady = true;
    }

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    canvas.addEventListener("pointerdown", (event) => {
      const contract = signerContract();
      if (!contract || !["published", "confirmed"].includes(contract.status)) return;
      if (!canvasReady) resize();
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const p = point(event);
      context.beginPath();
      context.moveTo(p.x, p.y);
      signatureDirty = true;
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!drawing) return;
      const p = point(event);
      context.lineTo(p.x, p.y);
      context.stroke();
    });

    canvas.addEventListener("pointerup", (event) => {
      const wasDrawing = drawing;
      drawing = false;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture may already be released.
      }
      if (wasDrawing && contract?.status === "draft") {
        contract.fields.partyASignature = canvas.toDataURL("image/png");
        contract.updatedAt = nowIso();
        saveStore(true);
        renderPreview();
      }
    });

    canvas.addEventListener("pointerleave", () => {
      drawing = false;
    });

    window.addEventListener("resize", resize);
    resizeSignatureCanvas = resize;
    setTimeout(resize, 0);
  }

  function setupPartyASignatureCanvas() {
    const canvas = document.getElementById("partyASignatureCanvas");
    if (!canvas) return;
    const contract = currentContract();
    const context = canvas.getContext("2d");
    const canEdit = contract?.status === "draft";
    let drawing = false;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 2.2;
      context.strokeStyle = "#111";
      if (contract?.fields.partyASignature) {
        const image = new Image();
        image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
        image.src = contract.fields.partyASignature;
      }
    }

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    canvas.addEventListener("pointerdown", (event) => {
      if (!canEdit) return;
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const p = point(event);
      context.beginPath();
      context.moveTo(p.x, p.y);
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!drawing) return;
      const p = point(event);
      context.lineTo(p.x, p.y);
      context.stroke();
    });

    canvas.addEventListener("pointerup", (event) => {
      drawing = false;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture may already be released.
      }
    });

    canvas.addEventListener("pointerleave", () => {
      drawing = false;
    });

    document.getElementById("clearPartyASignBtn")?.addEventListener("click", () => {
      if (!contract || contract.status !== "draft") return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      contract.fields.partyASignature = "";
      contract.updatedAt = nowIso();
      saveStore(true);
      renderForm();
      renderPreview();
    });

    document.getElementById("savePartyASignBtn")?.addEventListener("click", () => {
      if (!contract || contract.status !== "draft") return;
      contract.fields.partyASignature = canvas.toDataURL("image/png");
      contract.updatedAt = nowIso();
      saveStore(true);
      renderForm();
      renderPreview();
    });

    setTimeout(resize, 0);
  }

  function clearSignatureCanvas(showMessage) {
    const canvas = document.getElementById("signatureCanvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    signatureDirty = false;
    if (showMessage) showSignMessage("签名已清除。");
  }

  function loadStore() {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.contracts) && parsed.contracts.length) {
          parsed.contracts = parsed.contracts.map(normalizeContract);
          parsed.clauseVersions = normalizeClauseVersions(parsed.clauseVersions);
          parsed.activeClauseVersionId = parsed.clauseVersions.some((version) => version.id === parsed.activeClauseVersionId)
            ? parsed.activeClauseVersionId
            : parsed.clauseVersions[parsed.clauseVersions.length - 1].id;
          if (!parsed.contracts.some((contract) => contract.id === parsed.selectedId)) {
            parsed.selectedId = parsed.contracts[0].id;
          }
          return parsed;
        }
      } catch (error) {
        console.warn("Failed to load store", error);
      }
    }
    const contract = makeContract();
    const clauseVersions = seedClauseVersions();
    return { selectedId: contract.id, contracts: [contract], clauseVersions, activeClauseVersionId: clauseVersions[0].id };
  }

  function normalizeContract(contract) {
    const fields = { ...DEFAULT_FIELDS, ...(contract.fields || {}) };
    if (!fields.firstReviewDate && fields.reviewDate) fields.firstReviewDate = fields.reviewDate;
    if (!fields.finalReviewDate && fields.reviewDate) fields.finalReviewDate = fields.reviewDate;
    if (!fields.partyBPhone && fields.phone) fields.partyBPhone = fields.phone;
    if (!fields.retentionDate && fields.retentionPeriod) fields.retentionDate = normalizeDateLike(fields.retentionPeriod) || DEFAULT_FIELDS.retentionDate;
    if (!fields.sampleShippingInfo) fields.sampleShippingInfo = DEFAULT_FIELDS.sampleShippingInfo;
    if (fields.sampleShippingInfo === "寄样") fields.sampleShippingInfo = "已寄样";
    if (fields.sampleShippingInfo === "不寄样" || fields.sampleShippingInfo === "待确认") fields.sampleShippingInfo = "未寄样";
    return {
      ...contract,
      token: contract.token || randomToken(18),
      audit: Array.isArray(contract.audit) ? contract.audit : [],
      fields,
      snapshot: contract.snapshot
        ? {
            ...contract.snapshot,
            fields: {
              ...DEFAULT_FIELDS,
              ...(contract.snapshot.fields || fields),
              firstReviewDate: contract.snapshot.fields?.firstReviewDate || contract.snapshot.fields?.reviewDate || fields.firstReviewDate,
              finalReviewDate: contract.snapshot.fields?.finalReviewDate || contract.snapshot.fields?.reviewDate || fields.finalReviewDate,
              partyBPhone: contract.snapshot.fields?.partyBPhone || contract.snapshot.fields?.phone || fields.partyBPhone,
              retentionDate: contract.snapshot.fields?.retentionDate || normalizeDateLike(contract.snapshot.fields?.retentionPeriod) || fields.retentionDate,
              sampleShippingInfo: contract.snapshot.fields?.sampleShippingInfo || fields.sampleShippingInfo,
            },
          }
        : null,
    };
  }

  function saveStore(announce) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    if (announce && channel) channel.postMessage({ from: INSTANCE_ID, at: nowIso() });
  }

  function makeContract(fields = {}) {
    const now = nowIso();
    return {
      id: randomToken(12),
      status: "draft",
      token: randomToken(18),
      fields: { ...DEFAULT_FIELDS, ...fields },
      snapshot: null,
      signature: null,
      audit: [makeAudit("创建合同", "系统生成合同草稿")],
      createdAt: now.slice(0, 10),
      updatedAt: now,
    };
  }

  function makeAudit(action, detail) {
    return { action, detail, at: nowIso() };
  }

  function currentContract() {
    return store.contracts.find((contract) => contract.id === store.selectedId) || store.contracts[0] || null;
  }

  function signerContract() {
    if (signerToken) {
      return store.contracts.find((contract) => contract.token === signerToken) || null;
    }
    return currentContract();
  }

  function renderFields(contract) {
    if (contract.snapshot && contract.status !== "draft") return contract.snapshot.fields;
    return contract.fields;
  }

  function renderClausesForContract(contract) {
    if (contract.snapshot && contract.status !== "draft") return contract.snapshot.clauses;
    return activeClauseVersion().sections;
  }

  function activeClauseVersion() {
    const versions = normalizeClauseVersions(store.clauseVersions);
    store.clauseVersions = versions;
    const activeId = versions.some((version) => version.id === store.activeClauseVersionId)
      ? store.activeClauseVersionId
      : versions[versions.length - 1].id;
    store.activeClauseVersionId = activeId;
    return versions.find((version) => version.id === activeId) || versions[versions.length - 1];
  }

  function seedClauseVersions() {
    return [
      {
        id: "clause-v1",
        version: "V1.0",
        maintainer: "甲方",
        updatedAt: nowIso(),
        sections: clone(DEFAULT_CLAUSES),
      },
    ];
  }

  function normalizeClauseVersions(versions) {
    if (!Array.isArray(versions) || !versions.length) return seedClauseVersions();
    return versions.map((version, index) => ({
      id: version.id || `clause-v${index + 1}`,
      version: version.version || `V1.${index}`,
      maintainer: version.maintainer || "甲方",
      updatedAt: version.updatedAt || nowIso(),
      sections: Array.isArray(version.sections) && version.sections.length ? version.sections : clone(DEFAULT_CLAUSES),
    }));
  }

  function parseHashRoute() {
    if (location.hash.startsWith("#sign=")) {
      signerToken = decodeURIComponent(location.hash.slice("#sign=".length));
      activeView = "signer";
    } else {
      signerToken = "";
    }
  }

  function buildSignLink(contract) {
    return `${location.href.split("#")[0]}#sign=${encodeURIComponent(contract.token)}`;
  }

  function createChannel() {
    try {
      return "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
    } catch (error) {
      return null;
    }
  }

  async function makeSnapshotHash(snapshot, signature) {
    const payload = JSON.stringify({
      snapshot,
      signature: {
        signerName: signature.signerName,
        signedAt: signature.signedAt,
        userAgent: signature.userAgent,
      },
    });
    if (window.crypto?.subtle && window.TextEncoder) {
      const bytes = new TextEncoder().encode(payload);
      const digest = await window.crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    let hash = 0;
    for (let index = 0; index < payload.length; index += 1) {
      hash = (hash << 5) - hash + payload.charCodeAt(index);
      hash |= 0;
    }
    return `local-${Math.abs(hash).toString(16)}`;
  }

  function generateContractNo() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `HT-${y}${m}${d}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function formatDateCn(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function formatRetentionDate(value) {
    if (value === "长期") return "长期";
    return formatDateCn(value);
  }

  function normalizeDateLike(value) {
    const text = String(value || "").trim();
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(text)) {
      const [year, month, day] = text.split("-");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    const date = new Date(text);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  }

  function formatMoney(value) {
    const number = Number(value || 0);
    if (!Number.isFinite(number)) return value || "¥0";
    return `¥${number.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
  }

  function moneyToChinese(value) {
    const number = Math.round(Number(value || 0) * 100) / 100;
    if (!Number.isFinite(number) || number <= 0) return "";
    const fraction = ["角", "分"];
    const digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
    const unit = [["元", "万", "亿"], ["", "拾", "佰", "仟"]];
    let head = number < 0 ? "负" : "";
    let n = Math.abs(number);
    let s = "";
    for (let i = 0; i < fraction.length; i += 1) {
      s += (digit[Math.floor(n * 10 * 10 ** i) % 10] + fraction[i]).replace(/零./, "");
    }
    s = s || "整";
    n = Math.floor(n);
    for (let i = 0; i < unit[0].length && n > 0; i += 1) {
      let p = "";
      for (let j = 0; j < unit[1].length && n > 0; j += 1) {
        p = digit[n % 10] + unit[1][j] + p;
        n = Math.floor(n / 10);
      }
      s = p.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + s;
    }
    return `人民币${head}${s.replace(/(零.)*零元/, "元").replace(/(零.)+/g, "零").replace(/^整$/, "零元整")}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function randomToken(length) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let index = 0; index < length; index += 1) token += chars[Math.floor(Math.random() * chars.length)];
    return token;
  }

  function bumpClauseVersion(version) {
    const match = String(version || "V1.0").match(/^V(\d+)\.(\d+)$/);
    if (!match) return "V1.1";
    return `V${match[1]}.${Number(match[2]) + 1}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();

(() => {
  const STORE_KEY = "simple-contract-system-v1";
  const AUTH_KEY = "simple-contract-system-auth-v1";
  const CHANNEL_NAME = "simple-contract-system-sync-v1";
  const CLAUSE_SEED_VERSION = "wlead-pdf-2026-04-23";
  const CLAUSE_SEED_LABEL = "PDF基准 V2026.04.23";
  const CONTRACT_TITLE = "达人内容发布合作协议";
  const DEFAULT_BRAND_OPTIONS = ["Wlead"];
  const DEFAULT_PLATFORM_OPTIONS = ["小红书", "抖音", "bilibili", "公众号", "视频号", "快手", "微博", "知乎", "B站"];
  const LOCKED_STATUSES = [];
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
        { key: "brand", label: "品牌", type: "combo", optionStoreKey: "brandOptions", options: DEFAULT_BRAND_OPTIONS, required: true },
        { key: "platform", label: "平台", type: "combo", optionStoreKey: "platformOptions", options: DEFAULT_PLATFORM_OPTIONS, required: true },
        { key: "platformAccount", label: "账号", placeholder: "请输入账号，不进入候选记录" },
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
        "1、甲方权利义务",
        "（1）本次合作内容制作具体要求，甲方应按照约定时间及时以书面形式发送给乙方，并保证各项内容要求符合相关法规，内容制作过程中为更高效完成创作，相应修改应及时总结告知乙方，且修改次数为（两次）。",
        "（2）对本次发布推广的内容，甲方可无偿进行再剪辑，相关内容甲方或甲方关联主体可在抖音、",
        "（3）甲方对本次合作费用有保密义务，所有达人发布后（14）天结算所有费用。",
        "2、乙方权利义务",
        "（1）在内容制作完成后乙方应将相关内容成稿以及原素材发送给甲方。",
        "（2）若甲方内容制作要求有违反国家政策法规，乙方有权拒绝代理发布。",
        "（3）乙方在内容制作过程中，所提供的策划、拍摄方案应保证不侵犯任何第三方的知识产权。",
        "（4）乙方应确保其提供的服务内容符合相关法律法规的规定，否则应赔偿甲方因此所遭受的损失，甲方对乙方服务内容的审核并不免除乙方的上述义务。",
        "（5）乙方应对本协议及服务过程中知悉的甲方信息予以保密，否则应赔偿甲方因此所遭受的损失，本条款在合同履行完毕、解除终止后继续有效，按照下述第6条约定。",
        "（6）在本次合作内容发布3个月内，乙方未经甲方同意不得对已发布内容进行删改变更。",
        "（7）若乙方试用产品后5日内决定终止合作，可书面告知甲方并寄回产品并结束与甲方的合作。",
        "（8）如乙方超过5日未做书面回复，视为乙方认可甲方产品，乙方须在双方约定时间内完成本次合作。",
      ],
    },
    {
      title: "四、违约责任",
      body: [
        "1、若乙方因自行策划内容出现知识产权侵权引起第三方追索或要求赔偿，由乙方承担责任。",
        "2、若甲方因定制内容有知识产权侵权引起第三方追索或要求赔偿，由甲方承担责任。",
        "3、因任何一方原因违约，需按协议费用金额的10%向对方支付违约金。",
      ],
    },
    {
      title: "五、争议解决",
      body: [
        "1、因本协议订立、履行、解释所产生的任何争议适用中华人民共和国法律。",
        "2、因本协议订立、履行、解释所产生的任何争议首先由双方友好协商解决，协商不能解决的，任何一方均有权向履约方所在地人民法院提起诉讼。",
        "3、乙方在甲方催告后未按照合同约定提供服务，或提供内容与甲方所提需求不符，由此产生内容发布逾期，每逾期1天乙方应承担金额的10％作为违约金，如超过3天的，甲方有权解除合同并要求乙方按照上述第3点的约定赔偿违约金修改内容除外。",
        "4、甲方在乙方催告后未按照合同约定进行转账，由此产生支付逾期，每逾期1天甲方应承担金额的10％作为违约金内容未发布除外。",
      ],
    },
    {
      title: "六、协议的变更及生效",
      body: [
        "1、本协议壹式贰份，甲乙双方各持壹份，自双方签字或盖章之日起发生法律效力。",
        "2、协议中未尽事宜，经双方协商一致，可以签订书面补充协议，补充协议与本协议不一致的，以补充协议为准。本协议部分条款的无效或效力待定不影响其他条款的执行。",
      ],
    },
  ];

  const DEFAULT_FIELDS = {
    brand: "Wlead",
    platform: "小红书",
    platformAccount: "",
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
  let signerPayloadContract = null;
  let signatureDirty = false;
  let canvasReady = false;
  let resizeSignatureCanvas = () => {};

  init();

  function init() {
    bindEvents();
    parseHashRoute();
    applyAuthGate();
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
      applyAuthGate();
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
          signerPayloadContract = null;
          applyAuthGate();
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
    document.getElementById("contractForm").addEventListener("click", handleComboAction);
    document.getElementById("contractList").addEventListener("click", selectContractFromList);
    document.getElementById("searchInput").addEventListener("input", renderContractList);
    document.getElementById("authForm").addEventListener("submit", handleAuthSubmit);
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
    document.querySelector(".brand strong").textContent = signerToken ? CONTRACT_TITLE : "合同生成系统";
    if (!document.body.classList.contains("exporting-pdf")) {
      document.title = signerToken ? CONTRACT_TITLE : "合同生成系统";
    }
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
      const text = [contract.fields.brand, contract.fields.creatorName, contract.fields.platform, contract.fields.platformAccount, contract.fields.partyBPhone]
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
              <span>${escapeHtml(contract.fields.creatorName || "-")} · ${escapeHtml(formatPlatformLine(contract.fields))}</span>
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
    if (!contract) {
      document.getElementById("contractPreview").innerHTML = "";
      return;
    }
    document.getElementById("contractPreview").innerHTML = renderEditorWorkspace(contract);
    setupPartyASignatureCanvas();
  }

  function renderEditorWorkspace(contract) {
    const locked = !canEditContract(contract);
    const previewContract = makeLivePreviewContract(contract);
    const status = STATUS[contract.status] || STATUS.draft;
    return `
      <div class="editor-workspace">
        <section class="quick-editor">
          <div class="quick-editor-head">
            <h3>可编辑内容</h3>
            <span>${escapeHtml(status.label)}</span>
          </div>
          ${FIELD_GROUPS.map((group) => `
            <section class="form-section">
              <h3>${escapeHtml(group.title)}</h3>
              <div class="quick-field-grid">
                ${group.fields.map((field) => renderField(contract, field, locked)).join("")}
              </div>
            </section>
          `).join("")}
        </section>
        <section class="editor-preview-pane">
          <div class="editor-preview-title">合同预览</div>
          ${renderContractDocument(previewContract)}
        </section>
      </div>
    `;
  }

  function makeLivePreviewContract(contract) {
    if (!contract || contract.status === "draft") return contract;
    return {
      ...contract,
      snapshot: {
        ...(contract.snapshot || {}),
        fields: clone(contract.fields),
        clauses: clone(DEFAULT_CLAUSES),
        clauseVersion: CLAUSE_SEED_LABEL,
        clauseSeedVersion: CLAUSE_SEED_VERSION,
        publishedAt: contract.publishedAt || contract.snapshot?.publishedAt || nowIso(),
      },
    };
  }

  function refreshEditorPreview(contract) {
    const pane = document.querySelector(".editor-preview-pane");
    if (!pane || !contract) return;
    pane.innerHTML = `
      <div class="editor-preview-title">合同预览</div>
      ${renderContractDocument(makeLivePreviewContract(contract))}
    `;
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
    if (field.type === "combo") {
      const options = normalizeOptions(comboOptions(field), [], [value]);
      return `
        <div class="select-manager">
          <select data-field-key="${field.key}" ${disabled}>
            ${options.map((option) => `<option value="${escapeAttr(option)}" ${String(option) === String(value) ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
          </select>
          <button class="ghost-button option-button" type="button" data-option-add="${escapeAttr(field.key)}" ${disabled}>新增</button>
          <button class="ghost-button option-button danger-option" type="button" data-option-delete="${escapeAttr(field.key)}" ${disabled}>删除当前</button>
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
      <input data-field-key="${field.key}" type="${field.type || "text"}" value="${escapeAttr(value)}" placeholder="${escapeAttr(field.placeholder || "")}" ${disabled} />
    `;
  }

  function renderPreview() {
    const contract = currentContract();
    if (!contract) return;
    const status = STATUS[contract.status] || STATUS.draft;
    document.getElementById("previewMeta").textContent = `${status.label} · ${contract.fields.brand || "未命名合同"}`;
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
      status.textContent = signerToken
        ? "签署链接缺少合同数据，请让甲方重新复制最新签署链接。"
        : "暂无可签署达人内容发布合作协议。请先由甲方发布，或打开乙方签署链接。";
      preview.innerHTML = "";
      meta.textContent = "待发布";
    } else {
      const statusInfo = STATUS[contract.status] || STATUS.draft;
      status.textContent = `当前状态：${CONTRACT_TITLE} · ${statusInfo.label}`;
      preview.innerHTML = renderContractDocument(contract);
      meta.textContent = `${CONTRACT_TITLE} · ${statusInfo.label}`;
    }
    document.getElementById("signerName").disabled = !canSign;
    document.getElementById("confirmCheckbox").disabled = !canSign;
    document.getElementById("confirmCheckbox").checked = Boolean(contract && ["confirmed", "signed"].includes(contract.status));
    if (contract?.status === "signed" && contract.signature?.signerName) {
      document.getElementById("signerName").value = contract.signature.signerName;
    }
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
    if (signerToken) {
      const contract = signerContract();
      const status = contract ? STATUS[contract.status]?.label || "待发布" : "待发布";
      document.getElementById("syncState").textContent = `${CONTRACT_TITLE} · ${status}`;
      return;
    }
    const contract = currentContract();
    const status = contract ? STATUS[contract.status]?.label || "草稿" : "无合同";
    document.getElementById("syncState").textContent = `本地已同步 · ${status}`;
  }

  function renderEditableContractDocument(contract) {
    if (!canEditContract(contract)) return renderContractDocument(contract);
    const fields = contract.fields;
    const clauses = DEFAULT_CLAUSES;
    const editable = (key) => renderInlineField(contract, fieldConfig(key), false);
    return `
      <article class="contract-document editable-contract">
        <section class="contract-page">
          <h1 class="doc-title">${CONTRACT_TITLE}</h1>
          <section class="editable-block">
            <h3>一、合作内容</h3>
            <div class="embedded-grid two-col">
              ${editable("brand")}
              ${editable("creatorName")}
              ${editable("platform")}
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

  function comboOptions(field) {
    const stored = store[field.optionStoreKey];
    return normalizeOptions(Array.isArray(stored) ? stored : [], Array.isArray(stored) ? [] : field.options || []);
  }

  function rememberComboOption(key, value) {
    const field = fieldConfig(key);
    if (field.type !== "combo" || !field.optionStoreKey) return false;
    const previous = Array.isArray(store[field.optionStoreKey]) ? store[field.optionStoreKey] : normalizeOptions([], field.options || []);
    const next = normalizeOptions(previous, [], [value]);
    const changed = next.length !== previous.length || next.some((option, index) => option !== previous[index]);
    if (changed) store[field.optionStoreKey] = next;
    return changed;
  }

  function removeComboOption(key, value) {
    const field = fieldConfig(key);
    if (field.type !== "combo" || !field.optionStoreKey) return false;
    const target = String(value || "").trim().toLowerCase();
    const previous = comboOptions(field);
    const next = previous.filter((option) => option.toLowerCase() !== target);
    store[field.optionStoreKey] = next;
    return next.length !== previous.length;
  }

  function handleComboAction(event) {
    const add = event.target.closest("[data-option-add]");
    const remove = event.target.closest("[data-option-delete]");
    const action = add || remove;
    if (!action) return;
    event.preventDefault();
    const key = action.dataset.optionAdd || action.dataset.optionDelete;
    const contract = currentContract();
    const field = fieldConfig(key);
    if (field.type !== "combo") return;
    if (!canEditContract(contract)) return;

    if (add) {
      const value = window.prompt(`请输入新的${field.label}`)?.trim() || "";
      if (!value) return;
      rememberComboOption(key, value);
      contract.fields[key] = value;
    }

    if (remove) {
      const value = contract.fields[key] || "";
      if (!value) return;
      const ok = window.confirm(`确定从${field.label}列表删除「${value}」？`);
      if (!ok) return;
      removeComboOption(key, value);
      const nextOptions = comboOptions(field);
      contract.fields[key] = nextOptions[0] || "";
    }

    markContractChanged(contract);
    saveStore(true);
    refreshShareLink(contract);
    renderContractList();
    renderMonthlyStats();
    renderForm();
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
          <h1 class="doc-title">${CONTRACT_TITLE}</h1>
          <section class="doc-section">
            <h3>一、合作内容</h3>
            <table class="info-table">
              <tr><th>品牌</th><td>${escapeHtml(fields.brand || "-")}</td><th>博主名称</th><td>${escapeHtml(fields.creatorName || "-")}</td></tr>
              <tr><th>平台</th><td>${escapeHtml(fields.platform || "-")}</td><th>账号</th><td>${escapeHtml(fields.platformAccount || "-")}</td></tr>
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
    if (!canEditContract(contract)) return;
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
    markContractChanged(contract);
    saveStore(true);
    refreshShareLink(contract);
    refreshEditorPreview(contract);
    renderContractList();
    renderMonthlyStats();
  }

  function handleFieldChange(event) {
    const key = event.target.dataset.fieldKey;
    if (!key) return;
    if (event.target.type !== "file") {
      handleFieldInput(event);
      if (rememberComboOption(key, event.target.value)) {
        saveStore(true);
        renderForm();
      }
      return;
    }
    const contract = currentContract();
    if (!canEditContract(contract)) return;
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showValidation(["请上传图片格式的甲方签名。"]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      contract.fields[key] = reader.result;
      markContractChanged(contract);
      saveStore(true);
      showValidation([]);
      refreshShareLink(contract);
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
    markContractChanged(contract);
    saveStore(true);
    showValidation([]);
    refreshShareLink(contract);
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
      clauses: clone(DEFAULT_CLAUSES),
      clauseVersion: CLAUSE_SEED_LABEL,
      clauseSeedVersion: CLAUSE_SEED_VERSION,
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
      imageData: compactSignatureDataUrl(canvas),
      confirmedAt: contract.confirmedAt || nowIso(),
      signedAt: nowIso(),
      userAgent: navigator.userAgent,
    };
    signature.snapshotHash = await makeSnapshotHash(contract.snapshot || { fields: contract.fields, clauses: clone(DEFAULT_CLAUSES) }, signature);
    contract.status = "signed";
    contract.signedAt = signature.signedAt;
    contract.signature = signature;
    contract.audit.push(makeAudit("乙方签署", `${signerName} 完成电子手写签名`));
    saveStore(true);
    renderAll();
    showSignMessage("签署已完成。请复制签署回传链接发送给甲方，甲方打开后会同步签名。", "ok", buildSignedReturnLink(contract));
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

  function showSignMessage(message, tone = "warn", actionLink = "") {
    const box = document.getElementById("signMessage");
    box.hidden = false;
    box.innerHTML = `
      <div>${escapeHtml(message)}</div>
      ${actionLink ? `
        <div class="sign-return-box">
          <input id="signReturnLink" type="text" value="${escapeAttr(actionLink)}" readonly />
          <button class="ghost-button" id="copySignReturnBtn" type="button">复制回传链接</button>
        </div>
      ` : ""}
    `;
    box.style.background = tone === "ok" ? "#eaf7ef" : "#fff7e7";
    box.style.color = tone === "ok" ? "#237044" : "#83540f";
    document.getElementById("copySignReturnBtn")?.addEventListener("click", async () => {
      const input = document.getElementById("signReturnLink");
      try {
        await navigator.clipboard.writeText(input.value);
        document.getElementById("copySignReturnBtn").textContent = "已复制";
      } catch (error) {
        input.select();
      }
    });
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

    window.addEventListener("resize", resize);
    resizeSignatureCanvas = resize;
    setTimeout(resize, 0);
  }

  function setupPartyASignatureCanvas() {
    const canvas = document.getElementById("partyASignatureCanvas");
    if (!canvas) return;
    const contract = currentContract();
    const context = canvas.getContext("2d");
    const canEdit = canEditContract(contract);
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
      if (!canEditContract(contract)) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      contract.fields.partyASignature = "";
      markContractChanged(contract);
      saveStore(true);
      refreshShareLink(contract);
      renderForm();
      renderPreview();
    });

    document.getElementById("savePartyASignBtn")?.addEventListener("click", () => {
      if (!canEditContract(contract)) return;
      contract.fields.partyASignature = canvas.toDataURL("image/png");
      markContractChanged(contract);
      saveStore(true);
      refreshShareLink(contract);
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

  function compactSignatureDataUrl(sourceCanvas) {
    const target = document.createElement("canvas");
    const sourceRatio = sourceCanvas.width && sourceCanvas.height ? sourceCanvas.width / sourceCanvas.height : 3;
    target.width = 720;
    target.height = Math.max(180, Math.round(target.width / sourceRatio));
    const context = target.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, target.width, target.height);
    context.drawImage(sourceCanvas, 0, 0, target.width, target.height);
    return target.toDataURL("image/jpeg", 0.82);
  }

  function loadStore() {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.contracts) && parsed.contracts.length) {
          parsed.contracts = parsed.contracts.map(normalizeContract);
          parsed.brandOptions = Array.isArray(parsed.brandOptions)
            ? normalizeOptions(parsed.brandOptions)
            : normalizeOptions([], DEFAULT_BRAND_OPTIONS, parsed.contracts.map((contract) => contract.fields.brand));
          parsed.platformOptions = Array.isArray(parsed.platformOptions)
            ? normalizeOptions(parsed.platformOptions)
            : normalizeOptions([], DEFAULT_PLATFORM_OPTIONS, parsed.contracts.map((contract) => contract.fields.platform));
          parsed.clauseVersions = normalizeClauseVersions(parsed.clauseVersions);
          const seededVersion = parsed.clauseVersions.find((version) => version.seedVersion === CLAUSE_SEED_VERSION);
          if (seededVersion && parsed.lastAppliedClauseSeed !== CLAUSE_SEED_VERSION) {
            parsed.activeClauseVersionId = seededVersion.id;
            parsed.lastAppliedClauseSeed = CLAUSE_SEED_VERSION;
          } else {
            parsed.activeClauseVersionId = parsed.clauseVersions.some((version) => version.id === parsed.activeClauseVersionId)
              ? parsed.activeClauseVersionId
              : parsed.clauseVersions[parsed.clauseVersions.length - 1].id;
          }
          if (!parsed.contracts.some((contract) => contract.id === parsed.selectedId)) {
            parsed.selectedId = parsed.contracts[0].id;
          }
          if (seededVersion) localStorage.setItem(STORE_KEY, JSON.stringify(parsed));
          return parsed;
        }
      } catch (error) {
        console.warn("Failed to load store", error);
      }
    }
    const contract = makeContract();
    const clauseVersions = seedClauseVersions();
    return {
      selectedId: contract.id,
      contracts: [contract],
      brandOptions: normalizeOptions([], DEFAULT_BRAND_OPTIONS, [contract.fields.brand]),
      platformOptions: normalizeOptions([], DEFAULT_PLATFORM_OPTIONS, [contract.fields.platform]),
      clauseVersions,
      activeClauseVersionId: clauseVersions[0].id,
      lastAppliedClauseSeed: CLAUSE_SEED_VERSION,
    };
  }

  function normalizeContract(contract) {
    const rawFields = contract.fields || {};
    const fields = { ...DEFAULT_FIELDS, ...rawFields };
    normalizePlatformFields(fields, rawFields);
    if (!fields.firstReviewDate && fields.reviewDate) fields.firstReviewDate = fields.reviewDate;
    if (!fields.finalReviewDate && fields.reviewDate) fields.finalReviewDate = fields.reviewDate;
    if (!fields.partyBPhone && fields.phone) fields.partyBPhone = fields.phone;
    if (!fields.retentionDate && fields.retentionPeriod) fields.retentionDate = normalizeDateLike(fields.retentionPeriod) || DEFAULT_FIELDS.retentionDate;
    if (!fields.sampleShippingInfo) fields.sampleShippingInfo = DEFAULT_FIELDS.sampleShippingInfo;
    if (fields.sampleShippingInfo === "寄样") fields.sampleShippingInfo = "已寄样";
    if (fields.sampleShippingInfo === "不寄样" || fields.sampleShippingInfo === "待确认") fields.sampleShippingInfo = "未寄样";
    const snapshot = normalizeSnapshot(contract.snapshot, fields);
    return {
      ...contract,
      token: contract.token || randomToken(18),
      audit: Array.isArray(contract.audit) ? contract.audit : [],
      fields,
      snapshot,
    };
  }

  function normalizeSnapshot(snapshot, fields) {
    if (!snapshot) return null;
    const rawSnapshotFields = snapshot.fields || fields;
    const normalized = {
      ...snapshot,
      fields: {
        ...DEFAULT_FIELDS,
        ...rawSnapshotFields,
        firstReviewDate: rawSnapshotFields.firstReviewDate || rawSnapshotFields.reviewDate || fields.firstReviewDate,
        finalReviewDate: rawSnapshotFields.finalReviewDate || rawSnapshotFields.reviewDate || fields.finalReviewDate,
        partyBPhone: rawSnapshotFields.partyBPhone || rawSnapshotFields.phone || fields.partyBPhone,
        retentionDate: rawSnapshotFields.retentionDate || normalizeDateLike(rawSnapshotFields.retentionPeriod) || fields.retentionDate,
        sampleShippingInfo: rawSnapshotFields.sampleShippingInfo || fields.sampleShippingInfo,
      },
    };
    normalizePlatformFields(normalized.fields, rawSnapshotFields);
    if (normalized.clauseSeedVersion !== CLAUSE_SEED_VERSION) {
      normalized.clauses = clone(DEFAULT_CLAUSES);
      normalized.clauseVersion = CLAUSE_SEED_LABEL;
      normalized.clauseSeedVersion = CLAUSE_SEED_VERSION;
    }
    return normalized;
  }

  function normalizeOptions(values, defaults = [], extras = []) {
    const seen = new Set();
    return [...defaults, ...(Array.isArray(values) ? values : []), ...extras]
      .map((value) => String(value || "").trim())
      .filter((value) => {
        const key = value.toLowerCase();
        if (!value || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function normalizePlatformFields(fields, rawFields = {}) {
    if (rawFields.platform) {
      fields.platform = String(rawFields.platform).trim() || DEFAULT_FIELDS.platform;
      fields.platformAccount = String(rawFields.platformAccount || "").trim();
      return;
    }
    const split = splitPlatformAccount(rawFields.platformAccount ?? fields.platformAccount);
    fields.platform = split.platform || fields.platform || DEFAULT_FIELDS.platform;
    fields.platformAccount = split.account || "";
  }

  function splitPlatformAccount(value) {
    const text = String(value || "").trim();
    if (!text) return { platform: "", account: "" };
    const parts = text.split(/\s*(?:\/|｜|\||,|，)\s*/).filter(Boolean);
    if (parts.length > 1) {
      return { platform: parts[0].trim(), account: parts.slice(1).join(" / ").trim() };
    }
    const known = DEFAULT_PLATFORM_OPTIONS.find((option) => option.toLowerCase() === text.toLowerCase());
    if (known) return { platform: known, account: "" };
    const prefix = DEFAULT_PLATFORM_OPTIONS.find((option) => text.toLowerCase().startsWith(option.toLowerCase()));
    if (prefix && text.length > prefix.length) {
      return {
        platform: prefix,
        account: text.slice(prefix.length).replace(/^[\s:：/｜|,，-]+/, "").trim(),
      };
    }
    return { platform: text, account: "" };
  }

  function formatPlatformLine(fields) {
    const platform = fields.platform || "-";
    const account = fields.platformAccount ? ` / ${fields.platformAccount}` : "";
    return `${platform}${account}`;
  }

  function canEditContract(contract) {
    return Boolean(contract) && !LOCKED_STATUSES.includes(contract.status);
  }

  function markContractChanged(contract) {
    if (!contract) return;
    if (contract.status === "signed") {
      contract.status = "published";
      contract.signature = null;
      contract.signedAt = "";
      contract.confirmedAt = "";
      contract.audit = Array.isArray(contract.audit) ? contract.audit : [];
      contract.audit.push(makeAudit("甲方修改合同", "已签署合同被甲方修改，原乙方签名失效，需重新签署"));
    }
    contract.updatedAt = nowIso();
    syncContractSnapshot(contract);
  }

  function syncContractSnapshot(contract) {
    if (!contract || contract.status === "draft") return;
    contract.snapshot = {
      ...(contract.snapshot || {}),
      fields: clone(contract.fields),
      clauses: clone(DEFAULT_CLAUSES),
      clauseVersion: CLAUSE_SEED_LABEL,
      clauseSeedVersion: CLAUSE_SEED_VERSION,
      publishedAt: contract.publishedAt || contract.snapshot?.publishedAt || nowIso(),
    };
  }

  function refreshShareLink(contract) {
    const shareInput = document.getElementById("shareLink");
    if (!shareInput || !contract || !["published", "confirmed", "signed"].includes(contract.status)) return;
    shareInput.value = buildSignLink(contract);
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
      return store.contracts.find((contract) => contract.token === signerToken) || signerPayloadContract || null;
    }
    return currentContract();
  }

  function renderFields(contract) {
    if (contract.snapshot && contract.status !== "draft") return contract.snapshot.fields;
    return contract.fields;
  }

  function renderClausesForContract(contract) {
    return DEFAULT_CLAUSES;
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
        id: `clause-${CLAUSE_SEED_VERSION}`,
        version: CLAUSE_SEED_LABEL,
        maintainer: "甲方",
        updatedAt: nowIso(),
        seedVersion: CLAUSE_SEED_VERSION,
        sections: clone(DEFAULT_CLAUSES),
      },
    ];
  }

  function normalizeClauseVersions(versions) {
    if (!Array.isArray(versions) || !versions.length) return seedClauseVersions();
    const normalized = versions.map((version, index) => ({
      id: version.id || `clause-v${index + 1}`,
      version: version.version || `V1.${index}`,
      maintainer: version.maintainer || "甲方",
      updatedAt: version.updatedAt || nowIso(),
      seedVersion: version.seedVersion || "",
      sections: Array.isArray(version.sections) && version.sections.length ? version.sections : clone(DEFAULT_CLAUSES),
    }));
    if (!normalized.some((version) => version.seedVersion === CLAUSE_SEED_VERSION)) {
      normalized.push(seedClauseVersions()[0]);
    }
    return normalized;
  }

  function parseHashRoute() {
    signerPayloadContract = null;
    const hash = location.hash.slice(1);
    if (hash.startsWith("sign=")) {
      const params = new URLSearchParams(hash);
      signerToken = params.get("sign") || "";
      signerPayloadContract = decodeSignPayload(params.get("payload"), signerToken);
      hydrateSignerPayloadContract();
      activeView = "signer";
    } else if (hash.startsWith("signed=")) {
      const params = new URLSearchParams(hash);
      const imported = decodeSignedPayload(params.get("payload"), params.get("signed") || "");
      signerToken = "";
      activeView = "editor";
      if (imported) {
        importSignedContract(imported);
        history.replaceState(null, "", location.pathname + location.search);
      }
    } else {
      signerToken = "";
    }
  }

  function applyAuthGate() {
    const authenticated = localStorage.getItem(AUTH_KEY) === "ok";
    document.body.classList.toggle("auth-locked", !signerToken && !authenticated);
  }

  function handleAuthSubmit(event) {
    event.preventDefault();
    const input = document.getElementById("authPassword");
    const message = document.getElementById("authMessage");
    if (input.value === "87654321") {
      localStorage.setItem(AUTH_KEY, "ok");
      input.value = "";
      message.hidden = true;
      applyAuthGate();
      renderAll();
      return;
    }
    message.hidden = false;
    message.textContent = "密码错误，请重新输入。";
    input.select();
  }

  function buildSignLink(contract) {
    const payload = encodeSignPayload(contract);
    return `${location.href.split("#")[0]}#sign=${encodeURIComponent(contract.token)}&payload=${encodeURIComponent(payload)}`;
  }

  function buildSignedReturnLink(contract) {
    const payload = encodeSignedPayload(contract);
    return `${location.href.split("#")[0]}#signed=${encodeURIComponent(contract.token)}&payload=${encodeURIComponent(payload)}`;
  }

  function encodeSignPayload(contract) {
    const fields = clone(contract.snapshot?.fields || contract.fields);
    return encodePayload({
      id: contract.id,
      token: contract.token,
      status: contract.status,
      fields,
      clauseSeedVersion: CLAUSE_SEED_VERSION,
      publishedAt: contract.publishedAt || contract.snapshot?.publishedAt || nowIso(),
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    });
  }

  function decodeSignPayload(payload, token) {
    if (!payload || !token) return null;
    try {
      const decoded = JSON.parse(decodePayload(payload));
      if (decoded.token !== token) return null;
      return normalizeContract({
        id: decoded.id || randomToken(12),
        status: ["published", "confirmed", "signed"].includes(decoded.status) ? decoded.status : "published",
        token,
        fields: decoded.fields || decoded.snapshot?.fields || {},
        snapshot: decoded.snapshot || {
          fields: decoded.fields || {},
          clauses: clone(DEFAULT_CLAUSES),
          clauseVersion: CLAUSE_SEED_LABEL,
          clauseSeedVersion: CLAUSE_SEED_VERSION,
          publishedAt: decoded.publishedAt || nowIso(),
        },
        signature: decoded.signature || null,
        audit: [],
        publishedAt: decoded.publishedAt || decoded.snapshot?.publishedAt || nowIso(),
        createdAt: decoded.createdAt || nowIso().slice(0, 10),
        updatedAt: decoded.updatedAt || nowIso(),
      });
    } catch (error) {
      console.warn("Failed to decode sign payload", error);
      return null;
    }
  }

  function encodeSignedPayload(contract) {
    return encodePayload({
      id: contract.id,
      token: contract.token,
      status: "signed",
      fields: clone(contract.snapshot?.fields || contract.fields),
      signature: clone(contract.signature),
      signedAt: contract.signedAt,
      confirmedAt: contract.confirmedAt,
      updatedAt: contract.updatedAt,
    });
  }

  function decodeSignedPayload(payload, token) {
    if (!payload || !token) return null;
    try {
      const decoded = JSON.parse(decodePayload(payload));
      if (decoded.token !== token || !decoded.signature?.imageData) return null;
      return normalizeContract({
        id: decoded.id || randomToken(12),
        status: "signed",
        token,
        fields: decoded.fields || decoded.snapshot?.fields || {},
        snapshot: decoded.snapshot || null,
        signature: decoded.signature,
        signedAt: decoded.signedAt || decoded.signature.signedAt || nowIso(),
        confirmedAt: decoded.confirmedAt || decoded.signature.confirmedAt || "",
        audit: [],
        createdAt: nowIso().slice(0, 10),
        updatedAt: decoded.updatedAt || nowIso(),
      });
    } catch (error) {
      console.warn("Failed to decode signed payload", error);
      return null;
    }
  }

  function importSignedContract(imported) {
    const existing = store.contracts.find((contract) => contract.token === imported.token || contract.id === imported.id);
    const target = existing || imported;
    if (existing) {
      existing.status = "signed";
      existing.fields = clone(imported.fields);
      existing.snapshot = clone(imported.snapshot || existing.snapshot || null);
      existing.signature = clone(imported.signature);
      existing.signedAt = imported.signedAt;
      existing.confirmedAt = imported.confirmedAt;
      existing.updatedAt = nowIso();
      existing.audit = Array.isArray(existing.audit) ? existing.audit : [];
      existing.audit.push(makeAudit("导入乙方签署", `${imported.signature.signerName || "乙方"} 的签名已回传`));
    } else {
      imported.audit = [makeAudit("导入乙方签署", `${imported.signature.signerName || "乙方"} 的签名已回传`)];
      store.contracts.unshift(imported);
    }
    store.selectedId = target.id;
    saveStore(false);
  }

  function hydrateSignerPayloadContract() {
    if (!signerToken || !signerPayloadContract) return;
    const existing = store.contracts.find((contract) => contract.token === signerToken);
    if (existing) {
      existing.status = signerPayloadContract.status;
      existing.fields = clone(signerPayloadContract.fields);
      existing.snapshot = clone(signerPayloadContract.snapshot);
      existing.signature = clone(signerPayloadContract.signature || null);
      existing.signedAt = signerPayloadContract.signedAt || "";
      existing.confirmedAt = signerPayloadContract.confirmedAt || "";
      existing.publishedAt = signerPayloadContract.publishedAt;
      existing.updatedAt = signerPayloadContract.updatedAt;
      store.selectedId = existing.id;
    } else {
      store.contracts.unshift(signerPayloadContract);
      store.selectedId = signerPayloadContract.id;
    }
    store.brandOptions = normalizeOptions(
      Array.isArray(store.brandOptions) ? store.brandOptions : [],
      Array.isArray(store.brandOptions) ? [] : DEFAULT_BRAND_OPTIONS,
      [signerPayloadContract.fields.brand],
    );
    store.platformOptions = normalizeOptions(
      Array.isArray(store.platformOptions) ? store.platformOptions : [],
      Array.isArray(store.platformOptions) ? [] : DEFAULT_PLATFORM_OPTIONS,
      [signerPayloadContract.fields.platform],
    );
    saveStore(false);
  }

  function encodePayload(value) {
    const json = JSON.stringify(value);
    if (window.TextEncoder) {
      const bytes = new TextEncoder().encode(json);
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodePayload(value) {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(base64);
    if (window.TextDecoder) {
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
    return decodeURIComponent(escape(binary));
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

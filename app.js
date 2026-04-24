(() => {
  const STORE_KEY = "simple-contract-system-v1";
  const AUTH_KEY = "simple-contract-system-auth-v1";
  const CHANNEL_NAME = "simple-contract-system-sync-v1";
  const SIGN_HASH_KEY = "s";
  const SIGN_PAYLOAD_KEY = "p";
  const SIGN_LINK_VERSION = 1;
  const CONTRACT_TITLE = "达人内容发布合作协议";
  const CLAUSE_SEED_VERSION = "wlead-pdf-2026-04-24";
  const CLAUSE_SEED_LABEL = "PDF基准 V2026.04.24";
  const DEFAULT_BRAND_OPTIONS = ["Wlead"];
  const DEFAULT_PLATFORM_OPTIONS = ["小红书", "抖音", "bilibili", "公众号"];
  const INSTANCE_ID = randomToken(8);
  const channel = createChannel();
  const SIGN_STATUS_TO_CODE = {
    published: "p",
    confirmed: "c",
    signed: "s",
    revoked: "r",
    draft: "d",
  };
  const SIGN_CODE_TO_STATUS = {
    p: "published",
    c: "confirmed",
    s: "signed",
    r: "revoked",
    d: "draft",
  };
  const SHARE_FIELD_KEY_MAP = {
    brand: "b",
    platform: "pf",
    platformAccount: "pa",
    creatorName: "c",
    partyBPhone: "ph",
    sampleShippingInfo: "ss",
    firstReviewDate: "fr",
    finalReviewDate: "tr",
    publishDate: "pd",
    retentionDate: "rd",
    partyAProvided: "ap",
    price: "pr",
    amountUpper: "au",
    partyASignDate: "ad",
    partyASignature: "as",
  };
  const SHARE_FIELD_KEY_MAP_REVERSE = Object.fromEntries(
    Object.entries(SHARE_FIELD_KEY_MAP).map(([fieldKey, shortKey]) => [shortKey, fieldKey]),
  );

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
        {
          key: "brand",
          label: "品牌",
          type: "combo",
          optionStoreKey: "brandOptions",
          options: DEFAULT_BRAND_OPTIONS,
          required: true,
        },
        { key: "creatorName", label: "博主名称", required: true },
        {
          key: "platform",
          label: "平台",
          type: "combo",
          optionStoreKey: "platformOptions",
          options: DEFAULT_PLATFORM_OPTIONS,
          required: true,
        },
        { key: "platformAccount", label: "账号", placeholder: "请输入账号，不进入候选记录" },
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
        "（1）本次合作内容制作具体要求，甲方应按照约定时间及时以书面形式发送给乙方，并保证各项内容要求符合相关法规，内容制作过程中为更高效完成创作，相应修改应及时总结告知乙方，且修改次数为（两次）",
        "（2）对本次发布推广的内容，甲方可无偿进行再剪辑，相关内容甲方或甲方关联主体可在抖音、",
        "（3）甲方对本次合作费用有保密义务,所有达人发布后（14）天结算所有费用",
        "2、乙方权利义务",
        "（1）在内容制作完成后乙方应将相关内容成稿以及原素材发送给甲方。",
        "（2）若甲方内容制作要求有违反国家政策法规，乙方有权拒绝代理发布。",
        "（3）乙方在内容制作过程中，所提供的策划、拍摄方案应保证不侵犯任何第三方的知识产权。",
        "（4）乙方应确保其提供的服务内容符合相关法律法规的规定，否则应赔偿甲方因此所遭受的损失，甲方对乙方服务内容的审核并不免除乙方的上述义务。",
        "（5）乙方应对本协议及服务过程中知悉的甲方信息予以保密，否则应赔偿甲方因此所遭受的损失，本条款在合同履行完毕、解除终止后继续有效，按照下述第 6 条约定",
        "（6）在本次合作内容发布 3 个月内，乙方未经甲方同意不得对已发布内容进行删改变更。",
        "（7）若乙方试用产品后 5 日内决定终止合作，可书面告知甲方并寄回产品并结束与甲方的合作。",
        "（8）如乙方超过 5 日未做书面回复，视为乙方认可甲方产品，乙方须在双方约定时间内完成本次合作",
      ],
    },
    {
      title: "四、违约责任",
      body: [
        "1、若乙方因自行策划内容出现知识产权侵权引起第三方追索或要求赔偿，由乙方承担责任。",
        "2、若甲方因定制内容有知识产权侵权引起第三方追索或要求赔偿，由甲方承担责任。",
        "3、因任何一方原因违约，需按协议费用金额的 10%向对方支付违约金。",
      ],
    },
    {
      title: "五、争议解决",
      body: [
        "1、因本协议订立、履行、解释所产生的任何争议适用中华人民共和国法律。",
        "2、因本协议订立、履行、解释所产生的任何争议首先由双方友好协商解决，协商不能解决的，任何一方均有权向履约方所在地人民法院提起诉讼。",
        "3、乙方在甲方催告后未按照合同约定提供服务，或提供内容与甲方所提需求不符，由此产生内容发布逾期，每逾期 1 天乙方应承担金额的 10％作为违约金，如超过 3 天的，甲方有权解除合同并要求乙方按照上述第 3 点的约定赔偿违约金修改内容除外",
        "4、甲方在乙方催告后未按照合同约定进行转账，由此产生支付逾期，每逾期 1 天甲方应承担金额的 10％作为违约金内容未发布除外",
      ],
    },
    {
      title: "六、协议的变更及生效",
      body: [
        "1、本协议壹式贰份，甲乙双方各持壹份，自双方签字或盖章之日起发生法律效力。",
        "2、协议中未尽事宜，经双方协商一致，可以签订书面补充协议，补充协议与本协议不一致的，以补充协议为准。本协议部分条款的无效或效力待定不影响其他条款的执行",
      ],
    },
  ];

  const DEFAULT_FIELDS = {
    brand: "Wlead",
    platform: "小红书",
    platformAccount: "@creator",
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
  let signerLinkWarning = "";
  let signatureDirty = false;
  let signerUploadData = "";
  let signerUploadName = "";
  let signerUploadKey = "";
  let openOptionPanelKey = "";
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
        if (activeView !== "signer" && isSignerHash()) {
          history.replaceState(null, "", location.pathname + location.search);
          signerToken = "";
          signerPayloadContract = null;
          signerLinkWarning = "";
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
    document.getElementById("clearSignBtn").addEventListener("click", () => {
      clearSignatureCanvas(true);
      resetSignerUpload();
      renderSignerUploadState(signerContract());
    });
    document.getElementById("submitSignBtn").addEventListener("click", submitSignature);
    document.getElementById("confirmCheckbox").addEventListener("change", confirmSigner);
    document.getElementById("signerUpload").addEventListener("change", handleSignerUploadChange);
    document.getElementById("contractForm").addEventListener("input", handleFieldInput);
    document.getElementById("contractForm").addEventListener("change", handleFieldChange);
    document.getElementById("contractForm").addEventListener("click", handleFormClick);
    document.getElementById("contractForm").addEventListener("keydown", handleFormKeydown);
    document.getElementById("contractForm").addEventListener("submit", (event) => event.preventDefault());
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
      const text = [
        contract.fields.brand,
        contract.fields.creatorName,
        contract.fields.platform,
        contract.fields.platformAccount,
        formatPlatformLine(contract.fields),
        contract.fields.partyBPhone,
      ]
        .join(" ")
        .toLowerCase();
      return !query || text.includes(query);
    });
    document.getElementById("contractCount").textContent = String(store.contracts.length);
    list.innerHTML = items
      .map((contract) => {
        const status = STATUS[contract.status] || STATUS.draft;
        return `
          <div class="contract-item${contract.id === store.selectedId ? " is-active" : ""}">
            <button class="contract-select-button" type="button" data-contract-id="${escapeAttr(contract.id)}">
              <span class="contract-item-main">
              <strong>${escapeHtml(contract.fields.brand || "未命名合同")}</strong>
              <span>${escapeHtml(contract.fields.creatorName || "-")} · ${escapeHtml(formatPlatformLine(contract.fields))}</span>
              <em class="status-pill ${status.className}">${status.label}</em>
              </span>
            </button>
            <button class="delete-contract-button" type="button" data-delete-contract-id="${escapeAttr(contract.id)}" title="删除合同">删除</button>
          </div>
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
    if (field.type === "combo") {
      const options = getComboOptions(field);
      const isOpen = openOptionPanelKey === field.key;
      return `
        <div class="option-manager${isOpen ? " is-open" : ""}" data-option-manager="${field.key}">
          <button class="option-trigger" type="button" data-option-toggle="${field.key}" ${disabled}>
            <span class="option-trigger-value">${escapeHtml(value || `请选择${field.label}`)}</span>
            <span class="option-trigger-action">${isOpen ? "收起" : "展开"}</span>
          </button>
          <div class="option-panel"${isOpen ? "" : " hidden"}>
            <div class="option-list">
              ${options.map((option) => `
                <div class="option-item">
                  <button
                    class="option-select${String(option) === String(value) ? " is-selected" : ""}"
                    type="button"
                    data-option-select="${field.key}"
                    data-option-value="${escapeAttr(option)}"
                    ${disabled}
                  >${escapeHtml(option)}</button>
                  <button
                    class="option-delete"
                    type="button"
                    data-option-delete="${field.key}"
                    data-option-value="${escapeAttr(option)}"
                    ${disabled}
                  >删除</button>
                </div>
              `).join("")}
            </div>
            <div class="option-add-row">
              <input
                data-option-new="${field.key}"
                type="text"
                value=""
                placeholder="新增${escapeAttr(field.label)}"
                ${disabled}
              />
              <button class="ghost-button" type="button" data-option-add="${field.key}" ${disabled}>新增</button>
            </div>
          </div>
        </div>
      `;
    }
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
      <input
        data-field-key="${field.key}"
        type="${field.type || "text"}"
        value="${escapeAttr(value)}"
        placeholder="${escapeAttr(field.placeholder || "")}"
        ${disabled}
      />
    `;
  }

  function getComboOptions(field) {
    if (!field.optionStoreKey) return normalizeOptions([], field.options || []);
    return normalizeOptions(store[field.optionStoreKey], []);
  }

  function handleFormClick(event) {
    const toggle = event.target.closest("[data-option-toggle]");
    if (toggle) {
      toggleOptionPanel(toggle.dataset.optionToggle);
      return;
    }
    const select = event.target.closest("[data-option-select]");
    if (select) {
      selectComboOption(select.dataset.optionSelect, select.dataset.optionValue || "");
      return;
    }
    const remove = event.target.closest("[data-option-delete]");
    if (remove) {
      removeComboOption(remove.dataset.optionDelete, remove.dataset.optionValue || "");
      return;
    }
    const add = event.target.closest("[data-option-add]");
    if (add) {
      addComboOption(add.dataset.optionAdd);
      return;
    }
    if (!event.target.closest("[data-option-manager]")) openOptionPanelKey = "";
  }

  function handleFormKeydown(event) {
    const optionInput = event.target.closest("[data-option-new]");
    if (!optionInput || event.key !== "Enter") return;
    event.preventDefault();
    addComboOption(optionInput.dataset.optionNew);
  }

  function toggleOptionPanel(fieldKey) {
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    openOptionPanelKey = openOptionPanelKey === fieldKey ? "" : fieldKey;
    renderForm();
  }

  function addComboOption(fieldKey) {
    const field = fieldConfig(fieldKey);
    if (field.type !== "combo" || !field.optionStoreKey) return;
    const input = document.querySelector(`[data-option-new="${fieldKey}"]`);
    const nextValue = String(input?.value || "").trim();
    if (!nextValue) {
      showValidation([`请输入新增${field.label}`]);
      return;
    }
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    store[field.optionStoreKey] = normalizeOptions(store[field.optionStoreKey], [], [nextValue]);
    contract.fields[fieldKey] = nextValue;
    contract.updatedAt = nowIso();
    openOptionPanelKey = "";
    saveStore(true);
    showValidation([]);
    renderAll();
  }

  function removeComboOption(fieldKey, value) {
    const field = fieldConfig(fieldKey);
    if (field.type !== "combo" || !field.optionStoreKey) return;
    const targetValue = String(value || "").trim();
    if (!targetValue) return;
    store[field.optionStoreKey] = normalizeOptions(store[field.optionStoreKey], [])
      .filter((option) => option.toLowerCase() !== targetValue.toLowerCase());
    saveStore(true);
    renderForm();
  }

  function selectComboOption(fieldKey, value) {
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    const field = fieldConfig(fieldKey);
    const nextValue = String(value || "").trim();
    if (!nextValue) return;
    if (field.type === "combo" && field.optionStoreKey) {
      store[field.optionStoreKey] = normalizeOptions(store[field.optionStoreKey], [], [nextValue]);
    }
    contract.fields[fieldKey] = nextValue;
    contract.updatedAt = nowIso();
    openOptionPanelKey = "";
    saveStore(true);
    showValidation([]);
    renderAll();
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
    const signerNameInput = document.getElementById("signerName");
    const confirmCheckbox = document.getElementById("confirmCheckbox");
    const signerUpload = document.getElementById("signerUpload");
    const canSign = contract && ["published", "confirmed"].includes(contract.status);
    if (!contract) {
      status.textContent = signerLinkWarning || "暂无可签署合同。请先由甲方发布合同，或打开乙方签署链接。";
      preview.innerHTML = "";
      meta.textContent = `${CONTRACT_TITLE} · 待发布`;
      signerNameInput.value = "";
    } else {
      const statusInfo = STATUS[contract.status] || STATUS.draft;
      status.textContent = `当前状态：${CONTRACT_TITLE} · ${statusInfo.label}`;
      preview.innerHTML = renderContractDocument(contract);
      meta.textContent = `${CONTRACT_TITLE} · ${statusInfo.label}`;
      if ((!signerNameInput.value || contract.status === "signed") && contract.signature?.signerName) {
        signerNameInput.value = contract.signature.signerName;
      }
    }
    if (contract) {
      const contractKey = contract.id || contract.token || "";
      if (signerUploadKey !== contractKey) {
        resetSignerUpload();
        signerUploadKey = contractKey;
      }
    } else {
      resetSignerUpload();
      signerUploadKey = "";
    }
    signerNameInput.disabled = !canSign;
    confirmCheckbox.disabled = !canSign;
    confirmCheckbox.checked = Boolean(contract && ["confirmed", "signed"].includes(contract.status));
    signerUpload.disabled = !canSign;
    document.getElementById("submitSignBtn").disabled = !canSign;
    document.getElementById("clearSignBtn").disabled = !canSign;
    document.getElementById("signerPrintBtn").disabled = !contract;
    renderSignerUploadState(contract);
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
    const signature = contract.signature || contract.snapshot?.signature || {};
    const partyASignatureValue = fields.partyASignature
      || contract.snapshot?.fields?.partyASignature
      || contract.fields?.partyASignature
      || "";
    const partyADateValue = fields.partyASignDate
      || contract.snapshot?.fields?.partyASignDate
      || contract.fields?.partyASignDate
      || "";
    const partyASignature = partyASignatureValue ? `<img src="${escapeAttr(partyASignatureValue)}" alt="甲方签名" />` : "";
    const partyADate = partyADateValue ? formatDateCn(partyADateValue) : "";
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
    readImageFileAsDataUrl(file, {
      maxWidth: 420,
      maxHeight: 120,
      type: "image/jpeg",
      quality: 0.8,
      fillStyle: "#fff",
    })
      .then((dataUrl) => {
        contract.fields[key] = dataUrl;
        contract.updatedAt = nowIso();
        saveStore(true);
        showValidation([]);
        renderForm();
      })
      .catch(() => {
        showValidation(["甲方签名图片读取失败，请重新上传。"]);
      });
  }

  function createContract() {
    const contract = makeContract();
    store.contracts.unshift(contract);
    store.selectedId = contract.id;
    activeView = "editor";
    document.getElementById("searchInput").value = "";
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
      clauseSeedVersion: activeClauseVersion().seedVersion || "",
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
    if (!signerUploadData && !signatureDirty) {
      showSignMessage("请上传签名图片或在签名区域手写签名。");
      return;
    }
    const canvas = document.getElementById("signatureCanvas");
    const signatureImage = signerUploadData || compactSignatureDataUrl(canvas);
    const signature = {
      signerName,
      imageData: signatureImage,
      confirmedAt: contract.confirmedAt || nowIso(),
      signedAt: nowIso(),
      userAgent: navigator.userAgent,
    };
    signature.snapshotHash = await makeSnapshotHash(contract.snapshot || { fields: contract.fields, clauses: clone(activeClauseVersion().sections) }, signature);
    contract.status = "signed";
    contract.signedAt = signature.signedAt;
    contract.signature = signature;
    syncSignedSignature(contract);
    contract.audit.push(makeAudit("乙方签署", `${signerName} 完成电子手写签名`));
    saveStore(true);
    showSignMessage("签署已完成，合同预览和导出 PDF 会显示乙方签名。", "ok");
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
    signerPayloadContract = null;
    signerLinkWarning = "";
    if (isSignerHash()) {
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
    const input = document.getElementById("shareLink");
    const value = input.value;
    if (!value) return;
    const copied = await copyTextToClipboard(value, input);
    document.getElementById("syncState").textContent = copied ? "签署链接已复制" : "请长按链接手动复制";
  }

  async function copyTextToClipboard(text, sourceInput) {
    if (!text) return false;
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // Fall through to the textarea copy path for mobile browsers.
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.opacity = "0";
    textarea.style.fontSize = "16px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(textarea);
    if (!copied && sourceInput) selectInputText(sourceInput);
    return copied;
  }

  function selectInputText(input) {
    input.focus();
    input.select();
    if (typeof input.setSelectionRange === "function") {
      input.setSelectionRange(0, input.value.length);
    }
  }

  function renderSignerUploadState(contract) {
    const status = document.getElementById("signerUploadState");
    const preview = document.getElementById("signerUploadPreview");
    if (!status || !preview) return;
    const currentImage = signerUploadData || contract?.signature?.imageData || contract?.snapshot?.signature?.imageData || "";
    if (currentImage) {
      preview.hidden = false;
      preview.src = currentImage;
      status.textContent = signerUploadData ? `已载入签名图片：${signerUploadName || "已上传"}` : "签名图片已就绪";
      return;
    }
    preview.hidden = true;
    preview.removeAttribute("src");
    status.textContent = contract && ["published", "confirmed"].includes(contract.status)
      ? "未上传，可直接上传签名图片或在下方手写签名。"
      : "未上传";
  }

  function resetSignerUpload() {
    signerUploadData = "";
    signerUploadName = "";
    const input = document.getElementById("signerUpload");
    if (input) input.value = "";
  }

  function handleSignerUploadChange(event) {
    const contract = signerContract();
    const file = event.target.files?.[0];
    if (!file) {
      resetSignerUpload();
      renderSignerUploadState(contract);
      return;
    }
    if (!contract || !["published", "confirmed"].includes(contract.status)) {
      resetSignerUpload();
      renderSignerUploadState(contract);
      return;
    }
    if (!file.type.startsWith("image/")) {
      resetSignerUpload();
      showSignMessage("请上传图片格式的乙方签名。");
      renderSignerUploadState(contract);
      return;
    }
    readImageFileAsDataUrl(file, { maxWidth: 720, maxHeight: 260, type: "image/png" })
      .then((dataUrl) => {
        signerUploadData = dataUrl;
        signerUploadName = file.name || "";
        showSignMessage("签名图片已载入，可直接提交或继续手写。", "ok");
        renderSignerUploadState(contract);
      })
      .catch(() => {
        resetSignerUpload();
        showSignMessage("乙方签名图片读取失败，请重新上传。");
        renderSignerUploadState(contract);
      });
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
      contract.fields.partyASignature = compactPartyASignatureDataUrl(canvas);
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

  function compactPartyASignatureDataUrl(sourceCanvas) {
    const target = document.createElement("canvas");
    const sourceRatio = sourceCanvas.width && sourceCanvas.height ? sourceCanvas.width / sourceCanvas.height : 4;
    target.width = 420;
    target.height = Math.max(105, Math.round(target.width / sourceRatio));
    const context = target.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, target.width, target.height);
    context.drawImage(sourceCanvas, 0, 0, target.width, target.height);
    return target.toDataURL("image/jpeg", 0.78);
  }

  function loadStore() {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.contracts) && parsed.contracts.length) {
          parsed.contracts = parsed.contracts.map(normalizeContract);
          parsed.brandOptions = normalizeOptions(
            parsed.brandOptions,
            Array.isArray(parsed.brandOptions) ? [] : DEFAULT_BRAND_OPTIONS,
            Array.isArray(parsed.brandOptions) ? [] : parsed.contracts.map((contract) => contract.fields.brand),
          );
          parsed.platformOptions = normalizeOptions(
            parsed.platformOptions,
            Array.isArray(parsed.platformOptions) ? [] : DEFAULT_PLATFORM_OPTIONS,
            Array.isArray(parsed.platformOptions) ? [] : parsed.contracts.map((contract) => contract.fields.platform),
          );
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
          if (!parsed.lastAppliedClauseSeed) {
            parsed.lastAppliedClauseSeed = CLAUSE_SEED_VERSION;
          }
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
      signature: contract.signature || snapshot?.signature || null,
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
        partyASignDate: rawSnapshotFields.partyASignDate || fields.partyASignDate,
        partyASignature: rawSnapshotFields.partyASignature || fields.partyASignature,
      },
      clauses: Array.isArray(snapshot.clauses) && snapshot.clauses.length ? snapshot.clauses : clone(DEFAULT_CLAUSES),
      clauseVersion: snapshot.clauseVersion || CLAUSE_SEED_LABEL,
      clauseSeedVersion: snapshot.clauseSeedVersion || "",
    };
    normalizePlatformFields(normalized.fields, rawSnapshotFields);
    if (shouldUpgradeSnapshotClauses(normalized)) {
      normalized.clauses = clone(DEFAULT_CLAUSES);
      normalized.clauseVersion = CLAUSE_SEED_LABEL;
      normalized.clauseSeedVersion = CLAUSE_SEED_VERSION;
    }
    return normalized;
  }

  function shouldUpgradeSnapshotClauses(snapshot) {
    if (!snapshot) return false;
    if (snapshot.clauseSeedVersion === CLAUSE_SEED_VERSION) return false;
    const firstClause = snapshot.clauses?.[0];
    const firstLine = firstClause?.body?.[0] || "";
    return firstClause?.title === "三、权利义务" && firstLine.includes("甲方应按约定向乙方提供合作需求");
  }

  function normalizeOptions(values, defaults = [], extras = []) {
    const seen = new Set();
    return [...defaults, ...(Array.isArray(values) ? values : []), ...(Array.isArray(extras) ? extras : [])]
      .map((value) => String(value || "").trim())
      .filter((value) => {
        const key = value.toLowerCase();
        if (!value || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function normalizePlatformFields(fields, rawFields = {}) {
    const explicitPlatform = String(rawFields.platform || fields.platform || "").trim();
    const rawAccountValue = rawFields.platformAccount;
    if (String(rawFields.platform || "").trim()) {
      fields.platform = explicitPlatform || DEFAULT_FIELDS.platform;
      fields.platformAccount = String(rawFields.platformAccount || "").trim();
      return;
    }
    if (rawAccountValue == null) {
      fields.platform = explicitPlatform || DEFAULT_FIELDS.platform;
      fields.platformAccount = String(fields.platformAccount || "").trim();
      return;
    }
    const split = splitPlatformAccount(rawAccountValue);
    if (split.account) {
      fields.platform = split.platform || explicitPlatform || DEFAULT_FIELDS.platform;
      fields.platformAccount = split.account;
      return;
    }
    const rawText = String(rawAccountValue || "").trim();
    const knownPlatform = DEFAULT_PLATFORM_OPTIONS.some((option) => option.toLowerCase() === split.platform.toLowerCase());
    if (knownPlatform) {
      fields.platform = split.platform || explicitPlatform || DEFAULT_FIELDS.platform;
      fields.platformAccount = "";
      return;
    }
    fields.platform = explicitPlatform || DEFAULT_FIELDS.platform;
    fields.platformAccount = rawText;
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
    if (/^@/.test(text)) return { platform: "", account: text };
    return { platform: text, account: "" };
  }

  function formatPlatformLine(fields) {
    const platform = String(fields?.platform || "").trim();
    const account = String(fields?.platformAccount || "").trim();
    if (platform && account) return `${platform} / ${account}`;
    return platform || account || "-";
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

  function syncSignedSignature(contract) {
    if (!contract?.signature?.imageData) return;
    contract.snapshot = {
      ...(contract.snapshot || {}),
      fields: {
        ...clone(contract.fields),
        ...(contract.snapshot?.fields || {}),
        partyASignDate: contract.snapshot?.fields?.partyASignDate || contract.fields.partyASignDate || "",
        partyASignature: contract.snapshot?.fields?.partyASignature || contract.fields.partyASignature || "",
      },
      clauses: clone(contract.snapshot?.clauses || activeClauseVersion().sections),
      clauseVersion: contract.snapshot?.clauseVersion || activeClauseVersion().version,
      clauseSeedVersion: contract.snapshot?.clauseSeedVersion || activeClauseVersion().seedVersion || "",
      publishedAt: contract.publishedAt || contract.snapshot?.publishedAt || nowIso(),
      signature: clone(contract.signature),
      signedAt: contract.signedAt || contract.signature.signedAt || nowIso(),
    };
  }

  function currentContract() {
    return store.contracts.find((contract) => contract.id === store.selectedId) || store.contracts[0] || null;
  }

  function signerContract() {
    if (signerToken) {
      const localContract = store.contracts.find((contract) => contract.token === signerToken) || null;
      if (localContract) {
        hydrateLocalSignerContract(localContract, signerPayloadContract);
        return localContract;
      }
      return signerPayloadContract || null;
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
    signerLinkWarning = "";
    const hash = location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get(SIGN_HASH_KEY) || params.get("sign") || "";
    if (token) {
      signerToken = token;
      signerPayloadContract = decodeSignPayload(params.get(SIGN_PAYLOAD_KEY) || params.get("payload"), signerToken);
      if (!signerPayloadContract) {
        signerLinkWarning = params.get("sign") && !params.get("payload") && !params.get(SIGN_PAYLOAD_KEY)
          ? "旧链接缺少合同数据，请由甲方重新发布后再发送最新签署链接。"
          : "签署链接数据不完整，请让甲方重新复制最新签署链接。";
      }
      activeView = "signer";
    } else {
      signerToken = "";
      signerUploadKey = "";
      resetSignerUpload();
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
    return `${location.href.split("#")[0]}#${SIGN_HASH_KEY}=${encodeURIComponent(contract.token)}&${SIGN_PAYLOAD_KEY}=${encodeURIComponent(payload)}`;
  }

  function encodeSignPayload(contract) {
    const snapshot = contract.snapshot || {
      fields: clone(contract.fields),
      clauses: clone(activeClauseVersion().sections),
      clauseVersion: activeClauseVersion().version,
      clauseSeedVersion: activeClauseVersion().seedVersion || "",
      publishedAt: contract.publishedAt || nowIso(),
    };
    const shouldSendClauses = shouldInlineClauses(snapshot.clauses || [], snapshot.clauseSeedVersion || "");
    return encodePayload({
      v: SIGN_LINK_VERSION,
      s: SIGN_STATUS_TO_CODE[contract.status] || SIGN_STATUS_TO_CODE.published,
      f: compactShareFields(snapshot.fields || contract.fields),
      ...(shouldSendClauses ? { cl: compactClauses(snapshot.clauses || []) } : {}),
      cv: snapshot.clauseVersion || activeClauseVersion().version,
      cs: snapshot.clauseSeedVersion || activeClauseVersion().seedVersion || "",
      pb: snapshot.publishedAt || contract.publishedAt || nowIso(),
      sg: compactSignature(contract.signature || snapshot.signature || null),
    });
  }

  function decodeSignPayload(payload, token) {
    if (!payload || !token) return null;
    try {
      const decoded = JSON.parse(decodePayload(payload));
      const fields = expandShareFields(decoded.f || {});
      const clauses = expandClauses(decoded.cl || []);
      const signature = expandSignature(decoded.sg);
      const publishedAt = decoded.pb || nowIso();
      return normalizeContract({
        id: `share-${randomToken(8)}`,
        status: SIGN_CODE_TO_STATUS[decoded.s] || "published",
        token,
        fields,
        snapshot: {
          fields: clone(fields),
          clauses,
          clauseVersion: decoded.cv || activeClauseVersion().version,
          clauseSeedVersion: decoded.cs || "",
          publishedAt,
          ...(signature ? { signature: clone(signature), signedAt: signature.signedAt || "" } : {}),
        },
        signature,
        signedAt: signature?.signedAt || "",
        confirmedAt: signature?.confirmedAt || "",
        audit: [],
        publishedAt,
        createdAt: publishedAt.slice(0, 10),
        updatedAt: nowIso(),
      });
    } catch (error) {
      console.warn("Failed to decode sign payload", error);
      return null;
    }
  }

  function compactShareFields(fields) {
    const compact = {};
    Object.entries(SHARE_FIELD_KEY_MAP).forEach(([fieldKey, shortKey]) => {
      if (fieldKey === "amountUpper") return;
      const rawValue = fields?.[fieldKey];
      if (rawValue == null) return;
      const value = String(rawValue).trim();
      if (!value) return;
      if (String(DEFAULT_FIELDS[fieldKey] ?? "").trim() === value) return;
      if (fieldKey === "partyASignature" && value.length > 3200) return;
      compact[shortKey] = value;
    });
    return compact;
  }

  function expandShareFields(compactFields) {
    const rawFields = {};
    Object.entries(compactFields || {}).forEach(([shortKey, value]) => {
      const fieldKey = SHARE_FIELD_KEY_MAP_REVERSE[shortKey];
      if (!fieldKey) return;
      rawFields[fieldKey] = value;
    });
    const fields = { ...DEFAULT_FIELDS, ...rawFields };
    normalizePlatformFields(fields, rawFields);
    fields.amountUpper = moneyToChinese(fields.price);
    return fields;
  }

  function compactClauses(clauses) {
    return (Array.isArray(clauses) ? clauses : []).map((clause) => ({
      t: clause.title,
      b: Array.isArray(clause.body) ? clause.body : [],
    }));
  }

  function shouldInlineClauses(clauses, clauseSeedVersion) {
    if (clauseSeedVersion && clauseSeedVersion === CLAUSE_SEED_VERSION) return false;
    return JSON.stringify(clauses || []) !== JSON.stringify(DEFAULT_CLAUSES);
  }

  function expandClauses(compactClausesValue) {
    if (!Array.isArray(compactClausesValue) || !compactClausesValue.length) return clone(DEFAULT_CLAUSES);
    return compactClausesValue.map((clause, index) => ({
      title: clause.t || `条款 ${index + 1}`,
      body: Array.isArray(clause.b) && clause.b.length ? clause.b : [""],
    }));
  }

  function compactSignature(signature) {
    if (!signature?.imageData) return null;
    return {
      n: signature.signerName || "",
      i: signature.imageData,
      c: signature.confirmedAt || "",
      d: signature.signedAt || "",
      h: signature.snapshotHash || "",
    };
  }

  function expandSignature(signature) {
    if (!signature?.i) return null;
    return {
      signerName: signature.n || "",
      imageData: signature.i,
      confirmedAt: signature.c || "",
      signedAt: signature.d || "",
      snapshotHash: signature.h || "",
    };
  }

  function hydrateLocalSignerContract(localContract, payloadContract) {
    if (!localContract || !payloadContract) return;
    let changed = false;
    if (!localContract.snapshot && payloadContract.snapshot) {
      localContract.snapshot = clone(payloadContract.snapshot);
      changed = true;
    }
    if (!localContract.signature && payloadContract.signature) {
      localContract.signature = clone(payloadContract.signature);
      changed = true;
    }
    if (!localContract.fields.partyASignDate && payloadContract.fields.partyASignDate) {
      localContract.fields.partyASignDate = payloadContract.fields.partyASignDate;
      changed = true;
    }
    if (!localContract.fields.partyASignature && payloadContract.fields.partyASignature) {
      localContract.fields.partyASignature = payloadContract.fields.partyASignature;
      changed = true;
    }
    if (localContract.snapshot?.fields) {
      if (!localContract.snapshot.fields.partyASignDate && payloadContract.fields.partyASignDate) {
        localContract.snapshot.fields.partyASignDate = payloadContract.fields.partyASignDate;
        changed = true;
      }
      if (!localContract.snapshot.fields.partyASignature && payloadContract.fields.partyASignature) {
        localContract.snapshot.fields.partyASignature = payloadContract.fields.partyASignature;
        changed = true;
      }
    }
    if (!localContract.confirmedAt && payloadContract.confirmedAt) {
      localContract.confirmedAt = payloadContract.confirmedAt;
      changed = true;
    }
    if (!localContract.signedAt && payloadContract.signedAt) {
      localContract.signedAt = payloadContract.signedAt;
      changed = true;
    }
    if (changed) saveStore(false);
  }

  function isSignerHash() {
    return location.hash.startsWith(`#${SIGN_HASH_KEY}=`) || location.hash.startsWith("#sign=");
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

  function readImageFileAsDataUrl(file, options = {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read-failed"));
      reader.onload = () => {
        resizeImageDataUrl(String(reader.result || ""), options).then(resolve).catch(reject);
      };
      reader.readAsDataURL(file);
    });
  }

  function resizeImageDataUrl(dataUrl, options = {}) {
    if (!String(dataUrl || "").startsWith("data:image/")) return Promise.resolve(dataUrl);
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onerror = () => reject(new Error("image-load-failed"));
      image.onload = () => {
        const maxWidth = options.maxWidth || image.naturalWidth || 1;
        const maxHeight = options.maxHeight || image.naturalHeight || 1;
        const ratio = Math.min(
          1,
          maxWidth / Math.max(1, image.naturalWidth),
          maxHeight / Math.max(1, image.naturalHeight),
        );
        const width = Math.max(1, Math.round(image.naturalWidth * ratio));
        const height = Math.max(1, Math.round(image.naturalHeight * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (options.fillStyle) {
          context.fillStyle = options.fillStyle;
          context.fillRect(0, 0, width, height);
        }
        context.drawImage(image, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL(options.type || "image/png", options.quality || 0.92));
        } catch (error) {
          resolve(dataUrl);
        }
      };
      image.src = dataUrl;
    });
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

(() => {
  const BUILD_TAG = "20260428-one-time-payment-mode";
  const STORE_KEY = "simple-contract-system-v1";
  const AUTH_KEY = "simple-contract-system-auth-v1";
  const CHANNEL_NAME = "simple-contract-system-sync-v1";
  const SIGN_HASH_KEY = "s";
  const SIGN_PAYLOAD_KEY = "p";
  const SIGN_WORKSPACE_KEY = "ws";
  const SIGN_CONTRACT_KEY = "ct";
  const SIGN_WRITE_KEY = "wt";
  const SIGN_LINK_VERSION = 1;
  const SUPABASE_FUNCTION_NAME = "sign-contract";
  const WORKSPACE_TABLE = "workspace_state";
  const REMOTE_SYNC_DEBOUNCE_MS = 900;
  const REMOTE_POLL_INTERVAL_MS = 4000;
  const REMOTE_REQUEST_TIMEOUT_MS = 8000;
  const SIGNER_LOAD_TIMEOUT_MS = 15000;
  const SIGNER_LOAD_RETRY_DELAY_MS = 1000;
  const SIGNER_LOAD_CACHE_MS = 10000;
  const SIGNER_SESSION_CACHE_PREFIX = "signer-contract-cache-v1:";
  const SIGNER_SUBMIT_SLOW_NOTICE_MS = 3000;
  const SIGNATURE_IMAGE_WIDTH = 520;
  const SIGNATURE_IMAGE_QUALITY = 0.72;
  const REMOTE_SAVE_RETRY_LIMIT = 3;
  const CONTRACT_TITLE = "达人内容发布合作协议";
  const CLAUSE_SEED_VERSION = "wlead-template-2026-04-28-flow-payment";
  const CLAUSE_SEED_LABEL = "PDF基准 V2026.04.28";
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
    draftSubmitDeadlineDate: "dsd",
    draftSubmitDeadlineTime: "dst",
    reviewContact: "rc",
    reviewFeedbackWorkdays: "rfw",
    sampleFeedbackNote: "sfn",
    finalRevisionWorkdays: "frw",
    publishTime: "pt",
    rescheduleNoticeHours: "rnh",
    maintenanceDays: "md",
    prepaymentWorkdays: "ppw",
    prepaymentPercent: "ppp",
    finalPaymentAfterPublishDays: "fpd",
    finalPaymentWorkdays: "fpw",
    finalPaymentPercent: "fpp",
    performanceMetric: "pm",
    deductionScenario: "dc",
    publishDate: "pd",
    retentionDate: "rd",
    partyAProvided: "ap",
    price: "pr",
    amountUpper: "au",
    promotionServiceFee: "psf",
    promotionServiceFeeUpper: "psu",
    paymentMode: "pmd",
    oneTimePaymentWorkdays: "otw",
    partyASignDate: "ad",
    partyASignature: "as",
  };
  const SHARE_FIELD_KEY_MAP_REVERSE = buildReverseMap(SHARE_FIELD_KEY_MAP);

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
      title: "档期与流程设置",
      fields: [
        { key: "draftSubmitDeadlineDate", label: "初稿提交截止日期", type: "date", required: true },
        { key: "draftSubmitDeadlineTime", label: "初稿提交截止时间", type: "time", required: true },
        { key: "reviewContact", label: "甲方指定联系人", required: true },
        { key: "reviewFeedbackWorkdays", label: "审核反馈工作日数", type: "number", required: true },
        { key: "finalRevisionWorkdays", label: "终稿修改工作日数", type: "number", required: true },
        { key: "publishTime", label: "最终发布时间", type: "time", required: true },
        { key: "rescheduleNoticeHours", label: "调整提前通知小时数", type: "number", required: true },
        { key: "sampleFeedbackNote", label: "样品反馈说明", type: "textarea", wide: true, required: true },
      ],
    },
    {
      title: "推广费用与支付设置",
      fields: [
        { key: "price", label: "价格", type: "number", required: true },
        { key: "amountUpper", label: "金额大写", readonly: true },
        { key: "promotionServiceFee", label: "一次性推广服务费", type: "number", required: true },
        { key: "promotionServiceFeeUpper", label: "推广服务费大写", readonly: true },
        {
          key: "paymentMode",
          label: "支付方式",
          type: "select",
          options: [
            { value: "installment", label: "分期付款" },
            { value: "one_time", label: "一次性付款" },
          ],
          required: true,
        },
        { key: "maintenanceDays", label: "发布后维护天数", type: "number", required: true },
        { key: "prepaymentWorkdays", label: "预付款工作日数", type: "number", required: true },
        { key: "prepaymentPercent", label: "预付款比例", type: "number", required: true },
        { key: "finalPaymentAfterPublishDays", label: "尾款发布后统计天数", type: "number", required: true },
        { key: "finalPaymentWorkdays", label: "尾款支付工作日数", type: "number", required: true },
        { key: "finalPaymentPercent", label: "尾款比例", type: "number", required: true },
        { key: "oneTimePaymentWorkdays", label: "一次性付款时限", required: true },
        { key: "performanceMetric", label: "数据达标标准", type: "textarea", wide: true, required: true },
        { key: "deductionScenario", label: "扣付情形说明", type: "textarea", wide: true, required: true },
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
      title: "三、档期与流程",
      body: [
        "（一）关键时间节点：",
        "内容初稿提交时间：乙方需在{{draftSubmitDeadline}}，将推广内容初稿（含文案、图片 / 视频素材）提交至甲方指定联系人{{reviewContact}}；",
        "甲方审核反馈时间：甲方收到初稿后{{reviewFeedbackWorkdays}}，需向乙方出具审核意见，逾期未反馈视为初稿合格；",
        "{{sampleFeedbackNote}}",
        "最终内容确认时间：若需修改，乙方需根据甲方意见在{{finalRevisionWorkdays}}完成修改并提交终稿，终稿经甲方书面确认后，乙方需在{{finalPublishDeadline}}完成{{publishPlatform}}平台发布；",
        "调整限制：乙方因特殊原因需要更改投稿或发布时间的，需提前{{rescheduleNoticeHours}}向甲方提交书面申请，经甲方确认后方可调整，未经同意不得擅自变更。",
      ],
    },
    {
      title: "四、推广费用与支付",
      body: [
        "（一）费用构成",
        "一次性推广服务费：人民币{{serviceFee}}（大写：{{serviceFeeUpper}}），包含内容创作、修改、发布及发布后{{maintenanceDays}}评论维护服务，其他额外费用另算。",
        "样品处理：样品为合作道具，合作结束后归乙方所有。",
        "（二）支付方式",
        "预付款：本合同签订后{{prepaymentWorkdays}}，甲方支付服务费的{{prepaymentPercent}}（即人民币{{prepaymentAmount}}）作为履约保证金；",
        "尾款：乙方按约定时间完成内容发布，且发布后{{finalPaymentAfterPublishDays}}内数据达标（达标标准：{{performanceMetric}}），后{{finalPaymentWorkdays}}内，甲方支付剩余{{finalPaymentPercent}}服务费（即人民币{{finalPaymentAmount}}）；",
        "扣付情形：{{deductionScenario}}",
      ],
    },
    {
      title: "五、权利义务",
      body: [
        "1、甲方权利义务",
        "（1）本次合作内容制作具体要求，甲方应按照约定时间及时以书面形式发送给乙方，并保证各项内容要求符合相关法规，内容制作过程中为更高效完成创作，相应修改应及时总结告知乙方，且修改次数为（两次）",
        "（2）对本次发布推广的内容，甲方可无偿进行再剪辑，相关内容甲方或甲方关联主体可在抖音、",
        "（3）甲方对本次合作费用有保密义务,所有达人发布后15~20个工作日内结算所有费用",
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
      title: "六、违约责任",
      body: [
        "1、若乙方因自行策划内容出现知识产权侵权引起第三方追索或要求赔偿，由乙方承担责任。",
        "2、若甲方因定制内容有知识产权侵权引起第三方追索或要求赔偿，由甲方承担责任。",
        "3、因任何一方原因违约，需按协议费用金额的 10%向对方支付违约金。",
      ],
    },
    {
      title: "七、争议解决",
      body: [
        "1、因本协议订立、履行、解释所产生的任何争议适用中华人民共和国法律。",
        "2、因本协议订立、履行、解释所产生的任何争议首先由双方友好协商解决，协商不能解决的，任何一方均有权向履约方所在地人民法院提起诉讼。",
        "3、乙方在甲方催告后未按照合同约定提供服务，或提供内容与甲方所提需求不符，由此产生内容发布逾期，每逾期 1 天乙方应承担金额的 10％作为违约金，如超过 3 天的，甲方有权解除合同并要求乙方按照上述第 3 点的约定赔偿违约金修改内容除外",
        "4、甲方在乙方催告后未按照合同约定进行转账，由此产生支付逾期，每逾期 1 天甲方应承担金额的 10％作为违约金内容未发布除外",
      ],
    },
    {
      title: "八、协议的变更及生效",
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
    draftSubmitDeadlineDate: "2026-04-25",
    draftSubmitDeadlineTime: "18:00",
    reviewContact: "18275785921",
    reviewFeedbackWorkdays: "1",
    sampleFeedbackNote: "收到样品后乙方需及时反馈给甲方，确认样品无损坏，样品问题不得影响初稿提交。",
    finalRevisionWorkdays: "1",
    publishDate: "2026-04-30",
    publishTime: "19:00",
    rescheduleNoticeHours: "48小时",
    retentionDate: "2026-07-30",
    partyAProvided: "品牌资料、拍摄要求、审核反馈、禁用词和发布注意事项。",
    price: "300",
    amountUpper: "人民币叁佰元整",
    promotionServiceFee: "300",
    promotionServiceFeeUpper: "人民币叁佰元整",
    paymentMode: "installment",
    maintenanceDays: "7天内",
    prepaymentWorkdays: "5个工作日内",
    prepaymentPercent: "50%",
    finalPaymentAfterPublishDays: "7天内",
    finalPaymentWorkdays: "10个工作日内",
    finalPaymentPercent: "50%",
    oneTimePaymentWorkdays: "15~20个工作日内",
    performanceMetric: "点赞>__、评论>__",
    deductionScenario: "若乙方未按约定时间交稿 / 发布、内容违规被平台删除、数据造假（如刷赞、刷评论），甲方有权暂缓或拒绝支付尾款，同时要求乙方限期整改。数据不达标但无违规行为的情形，甲方可要求乙方进行二次补发或延长维护服务。",
    partyASignDate: "",
    partyASignature: "",
  };

  const FIELD_LABEL_OVERRIDES = {
    draftSubmitDeadlineDate: "初稿提交截止日期",
    draftSubmitDeadlineTime: "初稿提交截止时间",
    reviewContact: "甲方指定联系人",
    reviewFeedbackWorkdays: "甲方审核反馈时限",
    finalRevisionWorkdays: "终稿修改完成时限",
    publishTime: "最终内容发布时间",
    rescheduleNoticeHours: "改期提前通知时限",
    sampleFeedbackNote: "样品反馈条文说明",
    promotionServiceFee: "一次性推广服务费",
    promotionServiceFeeUpper: "推广服务费大写",
    paymentMode: "支付方式",
    maintenanceDays: "发布后维护周期",
    prepaymentWorkdays: "预付款支付时限",
    prepaymentPercent: "预付款比例",
    finalPaymentAfterPublishDays: "尾款数据统计周期",
    finalPaymentWorkdays: "尾款支付时限",
    finalPaymentPercent: "尾款比例",
    oneTimePaymentWorkdays: "一次性付款时限",
    performanceMetric: "数据达标标准",
    deductionScenario: "扣付情形条文说明",
  };

  const FIELD_PREVIEW_HINTS = {
    draftSubmitDeadlineDate: "将更新到：三、档期与流程 > 内容初稿提交时间",
    draftSubmitDeadlineTime: "将更新到：三、档期与流程 > 内容初稿提交时间",
    reviewContact: "将更新到：三、档期与流程 > 甲方指定联系人",
    reviewFeedbackWorkdays: "将更新到：三、档期与流程 > 甲方审核反馈时间",
    finalRevisionWorkdays: "将更新到：三、档期与流程 > 最终内容确认时间",
    publishTime: "将更新到：三、档期与流程 > 最终内容确认时间",
    rescheduleNoticeHours: "将更新到：三、档期与流程 > 调整限制",
    sampleFeedbackNote: "将更新到：三、档期与流程 > 样品反馈说明",
    promotionServiceFee: "将更新到：四、推广费用与支付 > 一次性推广服务费",
    promotionServiceFeeUpper: "将更新到：四、推广费用与支付 > 一次性推广服务费大写金额",
    paymentMode: "将更新到：四、推广费用与支付 > 支付方式",
    maintenanceDays: "将更新到：四、推广费用与支付 > 发布后维护说明",
    prepaymentWorkdays: "将更新到：四、推广费用与支付 > 预付款条款",
    prepaymentPercent: "将更新到：四、推广费用与支付 > 预付款条款",
    finalPaymentAfterPublishDays: "将更新到：四、推广费用与支付 > 尾款条款",
    finalPaymentWorkdays: "将更新到：四、推广费用与支付 > 尾款条款",
    finalPaymentPercent: "将更新到：四、推广费用与支付 > 尾款条款",
    oneTimePaymentWorkdays: "将更新到：四、推广费用与支付 > 一次性付款条款",
    performanceMetric: "将更新到：四、推广费用与支付 > 数据达标标准",
    deductionScenario: "将更新到：四、推广费用与支付 > 扣付情形",
  };

  const supabaseConfig = normalizeSupabaseConfig(window.__HETONG_SUPABASE__ || {});
  const signerGatewayConfig = normalizeSignerGatewayConfig(window.__HETONG_SIGNER_GATEWAY__ || {});

  let store = loadStore();
  let activeView = "editor";
  let signerToken = "";
  let signerWorkspaceId = "";
  let signerWriteToken = "";
  let signerPayloadContract = null;
  let signerLinkWarning = "";
  let signerRemoteLoading = false;
  let signerSubmitInProgress = false;
  let signerSubmitSlowTimer = 0;
  let signerLoadPromise = null;
  let signerLoadKey = "";
  let signerLastLoadedKey = "";
  let signerLastLoadedAt = 0;
  let signatureDirty = false;
  let signerUploadData = "";
  let signerUploadName = "";
  let signerUploadKey = "";
  let openOptionPanelKey = "";
  let openSidebarFilterPanelKey = "";
  const contractListFilters = {
    brand: "",
    platform: "",
  };
  const initialStatsDate = new Date();
  let statsYear = initialStatsDate.getFullYear();
  let statsMonth = initialStatsDate.getMonth() + 1;
  let isMobileContractLibraryOpen = false;
  let canvasReady = false;
  let resizeSignatureCanvas = () => {};
  const partyASignatureDraftByContractId = new Map();
  let partyASignatureDrawingContractId = "";
  let partyASignatureCanvasContractId = "";
  let adminPreviewFreezeUntil = 0;
  let adminPreviewRefreshTimer = 0;
  let adminEditingReleaseTimer = 0;
  let pendingAdminPreviewRefresh = false;
  let lastContractPreviewIdentity = "";
  let adminEditingContractId = "";
  let adminEditingFieldKey = "";
  let adminEditingSessionUntil = 0;
  let adminDatePickerFieldKey = "";
  let activeInlineClauseToken = "";
  let pendingInlineClauseFocusToken = "";
  const clauseEditorDraftByVersionId = new Map();
  let clauseEditingVersionId = "";
  let clauseEditingFieldKey = "";
  let clauseEditingSessionUntil = 0;
  let clauseEditingReleaseTimer = 0;
  let pendingClauseViewRefresh = false;
  let lastClauseEditorIdentity = "";
  let supabaseClient = createSupabaseBrowserClient();
  let adminSession = null;
  let adminUser = null;
  let remoteSyncTimer = 0;
  let remotePollTimer = 0;
  let remoteSyncQueue = Promise.resolve();
  let remoteChannel = null;
  let remoteBootstrapDone = false;
  let applyingRemoteStore = false;
  let remoteSyncState = {
    connected: false,
    syncing: false,
    lastError: "",
    lastPulledAt: "",
    lastPushedAt: "",
  };
  const shareLinkState = Object.create(null);

  init();

  async function init() {
    window.__HETONG_BUILD__ = BUILD_TAG;
    document.documentElement.setAttribute("data-build", BUILD_TAG);
    bindEvents();
    parseHashRoute();
    await initializeSupabaseSession();
    applyAuthGate();
    setupSignatureCanvas();
    renderAll();
    if (signerWorkspaceId && signerToken) {
      loadSignerContractFromCloud();
    } else if (isAdminCloudReady()) {
      bootstrapRemoteWorkspace();
    }
    if (channel) {
      channel.onmessage = (event) => {
        if (event.data && event.data.from === INSTANCE_ID) return;
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
      if (signerWorkspaceId && signerToken) {
        loadSignerContractFromCloud();
      } else if (isAdminCloudReady()) {
        pullRemoteWorkspace("route-change");
      }
    });
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("exporting-pdf");
      document.getElementById("printRoot").setAttribute("aria-hidden", "true");
      document.getElementById("printRoot").innerHTML = "";
    });
    window.addEventListener("focus", () => {
      if (signerWorkspaceId && signerToken) {
        loadSignerContractFromCloud();
      } else if (isAdminCloudReady()) {
        pullRemoteWorkspace("focus");
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") return;
      if (signerWorkspaceId && signerToken) {
        loadSignerContractFromCloud();
      } else if (isAdminCloudReady()) {
        pullRemoteWorkspace("visibility");
      }
    });
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        activeView = button.dataset.view;
        if (activeView !== "editor") {
          isMobileContractLibraryOpen = false;
        }
        if (activeView !== "signer" && isSignerRoute()) {
          history.replaceState(null, "", location.pathname);
          signerToken = "";
          signerWorkspaceId = "";
          signerWriteToken = "";
          signerPayloadContract = null;
          signerLinkWarning = "";
          signerRemoteLoading = false;
        }
        renderAll();
        if (!signerToken && isAdminCloudReady()) {
          pullRemoteWorkspace("tab-switch");
        }
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
    document.getElementById("clausesView").addEventListener("input", handleClauseEditorInput);
    document.getElementById("clausesView").addEventListener("click", handleClauseTemplateClick);
    document.getElementById("clausesView").addEventListener("pointerdown", handleClauseEditorPointerDown, true);
    document.getElementById("clausesView").addEventListener("focusin", handleClauseEditorFocusIn);
    document.getElementById("clausesView").addEventListener("focusout", handleClauseEditorFocusOut);
    document.getElementById("clausesView").addEventListener("keydown", handleClauseEditorKeydown);
    document.getElementById("clearSignBtn").addEventListener("click", () => {
      clearSignatureCanvas(true);
      resetSignerUpload();
      renderSignerUploadState(signerContract());
    });
    document.getElementById("submitSignBtn").addEventListener("click", submitSignature);
    document.getElementById("confirmCheckbox").addEventListener("change", confirmSigner);
    document.getElementById("signerUpload").addEventListener("change", handleSignerUploadChange);
    const contractForm = document.getElementById("contractForm");
    contractForm.addEventListener("input", handleFieldInput);
    contractForm.addEventListener("change", handleFieldChange);
    contractForm.addEventListener("click", handleFormClick);
    contractForm.addEventListener("keydown", handleFormKeydown);
    contractForm.addEventListener("submit", (event) => event.preventDefault());
    contractForm.addEventListener("pointerdown", handleContractFormPointerDown, true);
    contractForm.addEventListener("focusin", handleContractFormFocusIn);
    contractForm.addEventListener("focusout", handleContractFormFocusOut);
    document.getElementById("contractList").addEventListener("click", selectContractFromList);
    document.getElementById("searchInput").addEventListener("input", renderContractList);
    document.getElementById("sidebarFilters").addEventListener("click", handleSidebarFilterClick);
    document.getElementById("statsYearSelect").addEventListener("change", handleStatsPeriodChange);
    document.getElementById("statsMonthSelect").addEventListener("change", handleStatsPeriodChange);
    const mobileLibraryToggle = document.getElementById("mobileLibraryToggle");
    if (mobileLibraryToggle) {
      mobileLibraryToggle.addEventListener("click", toggleMobileContractLibrary);
    }
    const mobileActionBar = document.getElementById("mobileActionBar");
    if (mobileActionBar) {
      mobileActionBar.addEventListener("click", handleMobileActionClick);
    }
    document.addEventListener("click", handleDocumentClick);
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
    renderSidebarFilters();
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
      if (query && !text.includes(query)) return false;
      if (contractListFilters.brand && String(contract.fields.brand || "") !== contractListFilters.brand) return false;
      if (contractListFilters.platform && String(contract.fields.platform || "") !== contractListFilters.platform) return false;
      return true;
    });
    document.getElementById("contractCount").textContent = String(store.contracts.length);
    renderMobileLibraryState(items.length);
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
    const statsTitle = document.getElementById("statsTitle");
    const yearSelect = document.getElementById("statsYearSelect");
    const monthSelect = document.getElementById("statsMonthSelect");
    const yearOptions = statsYearOptions();
    const normalizedYear = yearOptions.includes(statsYear) ? statsYear : yearOptions[0];
    statsYear = normalizedYear || initialStatsDate.getFullYear();
    statsMonth = Math.min(12, Math.max(1, Number(statsMonth) || initialStatsDate.getMonth() + 1));
    if (statsTitle) statsTitle.textContent = `${statsYear}年${statsMonth}月统计`;
    if (yearSelect) {
      yearSelect.innerHTML = yearOptions.map((year) => `<option value="${year}">${year}年</option>`).join("");
      yearSelect.value = String(statsYear);
    }
    if (monthSelect) {
      monthSelect.innerHTML = Array.from({ length: 12 }, (_, index) => {
        const monthValue = index + 1;
        return `<option value="${monthValue}">${monthValue}月</option>`;
      }).join("");
      monthSelect.value = String(statsMonth);
    }
    const month = `${statsYear}-${String(statsMonth).padStart(2, "0")}`;
    const monthContracts = store.contracts.filter((contract) => contractStatsMonthKey(contract) === month);
    const amount = monthContracts.reduce((sum, contract) => sum + Number(contract.fields.price || 0), 0);
    document.getElementById("monthCount").textContent = String(monthContracts.length);
    document.getElementById("monthAmount").textContent = formatMoney(amount);
    document.getElementById("signedCount").textContent = String(monthContracts.filter((contract) => contract.status === "signed").length);
  }

  function handleStatsPeriodChange(event) {
    if (event.target.id === "statsYearSelect") {
      statsYear = Number(event.target.value) || statsYear;
    } else if (event.target.id === "statsMonthSelect") {
      statsMonth = Number(event.target.value) || statsMonth;
    }
    renderMonthlyStats();
  }

  function statsYearOptions() {
    const years = new Set([initialStatsDate.getFullYear(), statsYear]);
    store.contracts.forEach((contract) => {
      const key = contractStatsMonthKey(contract);
      if (key) years.add(Number(key.slice(0, 4)));
    });
    return Array.from(years)
      .filter((year) => Number.isFinite(year) && year > 1900)
      .sort((left, right) => right - left);
  }

  function contractStatsMonthKey(contract) {
    const value = [
      contract && contract.createdAt,
      contract && contract.publishedAt,
      contract && contract.signedAt,
      contract && contract.updatedAt,
    ].find((item) => String(item || "").trim());
    const normalized = normalizeDateLike(value);
    return normalized ? normalized.slice(0, 7) : "";
  }

  function renderMobileLibraryState(visibleCount) {
    const toggle = document.getElementById("mobileLibraryToggle");
    const panel = document.getElementById("mobileLibraryPanel");
    if (!toggle || !panel) return;
    const count = typeof visibleCount === "number" ? visibleCount : store.contracts.length;
    const contract = currentContract();
    const status = contract ? (STATUS[contract.status] || STATUS.draft) : null;
    const summary = contract
      ? `${contract.fields.brand || "未命名合同"} · ${status ? status.label : "草稿"}`
      : "未选择合同";
    const countEl = document.getElementById("mobileContractCount");
    const summaryEl = document.getElementById("mobileContractSummary");
    const actionEl = document.getElementById("mobileLibraryToggleText");
    if (countEl) countEl.textContent = String(count);
    if (summaryEl) summaryEl.textContent = summary;
    if (actionEl) actionEl.textContent = isMobileContractLibraryOpen ? "收起" : "展开";
    toggle.setAttribute("aria-expanded", isMobileContractLibraryOpen ? "true" : "false");
    panel.classList.toggle("is-mobile-open", isMobileContractLibraryOpen);
  }

  function toggleMobileContractLibrary() {
    isMobileContractLibraryOpen = !isMobileContractLibraryOpen;
    renderMobileLibraryState();
  }

  function renderMobileActions(contract = currentContract()) {
    const bar = document.getElementById("mobileActionBar");
    if (!bar) return;
    const buttons = Array.from(bar.querySelectorAll("[data-mobile-action]"));
    buttons.forEach((button) => {
      const action = button.dataset.mobileAction;
      if (action === "new") {
        button.disabled = false;
      } else if (action === "save") {
        button.disabled = !contract || contract.status !== "draft";
      } else if (action === "publish") {
        button.disabled = !contract || contract.status !== "draft";
      } else if (action === "print") {
        button.disabled = !contract;
      }
    });
  }

  function handleMobileActionClick(event) {
    const button = getClosest(event.target, "[data-mobile-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.mobileAction;
    if (action === "new") {
      createContract();
    } else if (action === "save") {
      saveCurrentDraft();
    } else if (action === "publish") {
      publishContract();
    } else if (action === "print") {
      printCurrentContract();
    }
  }

  function scrollAdminEditorIntoViewOnMobile() {
    if (!window.matchMedia || !window.matchMedia("(max-width: 720px)").matches) return;
    window.requestAnimationFrame(() => {
      const target = document.querySelector(".main-area");
      if (target) target.scrollIntoView({ block: "start" });
    });
  }

  function renderSidebarFilters() {
    const root = document.getElementById("sidebarFilters");
    if (!root) return;
    root.innerHTML = [
      renderSidebarFilterManager("brand", "品牌", store.brandOptions || []),
      renderSidebarFilterManager("platform", "平台", store.platformOptions || []),
    ].join("");
  }

  function renderSidebarFilterManager(filterKey, label, values) {
    const currentValue = String(contractListFilters[filterKey] || "").trim();
    const isOpen = openSidebarFilterPanelKey === filterKey;
    const options = ["", ...normalizeOptions(values, [])];
    return `
      <div class="option-manager sidebar-filter-manager${isOpen ? " is-open" : ""}" data-sidebar-filter-manager="${filterKey}">
        <button class="option-trigger" type="button" data-sidebar-filter-toggle="${filterKey}">
          <span class="option-trigger-value">${escapeHtml(`${label}：${currentValue || "全部"}`)}</span>
          <span class="option-trigger-action">${isOpen ? "收起" : "筛选"}</span>
        </button>
        <div class="option-panel"${isOpen ? "" : " hidden"}>
          <div class="option-list">
            ${options.map((option) => {
              const valueLabel = option || "全部";
              const selected = option === currentValue;
              return `
                <div class="option-item sidebar-filter-item">
                  <button
                    class="option-select${selected ? " is-selected" : ""}"
                    type="button"
                    data-sidebar-filter-select="${filterKey}"
                    data-sidebar-filter-value="${escapeAttr(option)}"
                  >${escapeHtml(valueLabel)}</button>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderForm(options = {}) {
    const contract = currentContract();
    renderContractPreviewContent(contract, options);
  }

  function renderSidebarFilterManager(filterKey, label, values) {
    const currentValue = String(contractListFilters[filterKey] || "").trim();
    const isOpen = openSidebarFilterPanelKey === filterKey;
    const options = ["", ...normalizeOptions(values, [])];
    const displayValue = currentValue || "全部";
    return `
      <div class="option-manager sidebar-filter-manager${isOpen ? " is-open" : ""}" data-sidebar-filter-manager="${filterKey}">
        <button
          class="option-trigger sidebar-filter-button${currentValue ? " has-value" : ""}"
          type="button"
          data-sidebar-filter-toggle="${filterKey}"
          aria-expanded="${isOpen ? "true" : "false"}"
        >
          <span class="sidebar-filter-button-main">
            <span class="sidebar-filter-label">${escapeHtml(label)}</span>
            <span class="sidebar-filter-current">${escapeHtml(displayValue)}</span>
          </span>
          <span class="sidebar-filter-caret" aria-hidden="true">${isOpen ? "▴" : "▾"}</span>
        </button>
        <div class="option-panel sidebar-filter-panel"${isOpen ? "" : " hidden"}>
          <div class="option-list">
            ${options.map((option) => {
              const valueLabel = option || "全部";
              const selected = option === currentValue;
              return `
                <div class="option-item sidebar-filter-item">
                  <button
                    class="option-select${selected ? " is-selected" : ""}"
                    type="button"
                    data-sidebar-filter-select="${filterKey}"
                    data-sidebar-filter-value="${escapeAttr(option)}"
                  >${escapeHtml(valueLabel)}</button>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
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
        const normalizedOption = normalizeSelectOption(option);
        const selected = normalizedOption.value === String(value) ? "selected" : "";
        return `<option value="${escapeAttr(normalizedOption.value)}" ${selected}>${escapeHtml(normalizedOption.label)}</option>`;
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
    beginAdminEditingSession(event.target, contractFormFreezeDuration(event.target) || 1800);
    const paymentMode = getClosest(event.target, "[data-payment-mode-select]");
    if (paymentMode) {
      selectPaymentMode(paymentMode.dataset.paymentModeSelect || "");
      return;
    }
    const inlineToken = getClosest(event.target, "[data-inline-clause-token]");
    if (inlineToken) {
      openInlineClauseEditor(inlineToken.dataset.inlineClauseToken || "");
      return;
    }
    const inlineClose = getClosest(event.target, "[data-inline-clause-close]");
    if (inlineClose) {
      closeInlineClauseEditor({ forceRefresh: true });
      return;
    }
    const toggle = getClosest(event.target, "[data-option-toggle]");
    if (toggle) {
      toggleOptionPanel(toggle.dataset.optionToggle);
      return;
    }
    const select = getClosest(event.target, "[data-option-select]");
    if (select) {
      selectComboOption(select.dataset.optionSelect, select.dataset.optionValue || "");
      return;
    }
    const remove = getClosest(event.target, "[data-option-delete]");
    if (remove) {
      removeComboOption(remove.dataset.optionDelete, remove.dataset.optionValue || "");
      return;
    }
    const add = getClosest(event.target, "[data-option-add]");
    if (add) {
      addComboOption(add.dataset.optionAdd);
      return;
    }
    if (!getClosest(event.target, "[data-option-manager]")) openOptionPanelKey = "";
  }

  function handleSidebarFilterClick(event) {
    const toggle = getClosest(event.target, "[data-sidebar-filter-toggle]");
    if (toggle) {
      toggleSidebarFilterPanel(toggle.dataset.sidebarFilterToggle);
      return;
    }
    const select = getClosest(event.target, "[data-sidebar-filter-select]");
    if (select) {
      selectSidebarFilterValue(select.dataset.sidebarFilterSelect, select.dataset.sidebarFilterValue || "");
      return;
    }
  }

  function handleDocumentClick(event) {
    if (openSidebarFilterPanelKey && !getClosest(event.target, "[data-sidebar-filter-manager]")) {
      openSidebarFilterPanelKey = "";
      renderSidebarFilters();
    }
  }

  function handleFormKeydown(event) {
    beginAdminEditingSession(event.target, event.target && event.target.type === "date" ? 12000 : 6000);
    if (getClosest(event.target, "[data-inline-clause-editor]")) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeInlineClauseEditor({ forceRefresh: true });
        return;
      }
      if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
        closeInlineClauseEditor({ forceRefresh: true });
        return;
      }
    }
    const optionInput = getClosest(event.target, "[data-option-new]");
    if (!optionInput || event.key !== "Enter") return;
    event.preventDefault();
    addComboOption(optionInput.dataset.optionNew);
  }

  function toggleOptionPanel(fieldKey) {
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    openOptionPanelKey = openOptionPanelKey === fieldKey ? "" : fieldKey;
    renderForm({ force: true, ignoreDefer: true });
  }

  function toggleSidebarFilterPanel(filterKey) {
    openSidebarFilterPanelKey = openSidebarFilterPanelKey === filterKey ? "" : filterKey;
    renderSidebarFilters();
  }

  function selectSidebarFilterValue(filterKey, value) {
    if (filterKey !== "brand" && filterKey !== "platform") return;
    contractListFilters[filterKey] = String(value || "").trim();
    openSidebarFilterPanelKey = "";
    renderContractList();
  }

  function addComboOption(fieldKey) {
    const field = fieldConfig(fieldKey);
    if (field.type !== "combo" || !field.optionStoreKey) return;
    const input = document.querySelector(`[data-option-new="${fieldKey}"]`);
    const nextValue = String(input ? input.value : "").trim();
    if (!nextValue) {
      showValidation([`请输入新增${field.label}`]);
      return;
    }
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    store[field.optionStoreKey] = normalizeOptions(store[field.optionStoreKey], [], [nextValue]);
    touchOptionStore(field.optionStoreKey);
    contract.fields[fieldKey] = nextValue;
    contract.updatedAt = nowIso();
    openOptionPanelKey = "";
    saveStore(true);
    showValidation([]);
    clearAdminEditingSession({ force: true, clearPending: true });
    renderContractList();
    renderMonthlyStats();
    renderPreview();
    renderForm({ force: true, ignoreDefer: true });
  }

  function normalizeSelectOption(option) {
    if (option && typeof option === "object") {
      const value = String(option.value == null ? "" : option.value).trim();
      const label = String(option.label == null ? value : option.label).trim();
      return { value, label: label || value };
    }
    const text = String(option == null ? "" : option).trim();
    return { value: text, label: text };
  }

  function removeComboOption(fieldKey, value) {
    const field = fieldConfig(fieldKey);
    if (field.type !== "combo" || !field.optionStoreKey) return;
    const targetValue = String(value || "").trim();
    if (!targetValue) return;
    store[field.optionStoreKey] = normalizeOptions(store[field.optionStoreKey], [])
      .filter((option) => option.toLowerCase() !== targetValue.toLowerCase());
    touchOptionStore(field.optionStoreKey);
    saveStore(true);
    clearAdminEditingSession({ force: true, clearPending: true });
    renderContractList();
    renderForm({ force: true, ignoreDefer: true });
    renderPreview();
  }

  function selectComboOption(fieldKey, value) {
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    const field = fieldConfig(fieldKey);
    const nextValue = String(value || "").trim();
    if (!nextValue) return;
    if (field.type === "combo" && field.optionStoreKey) {
      store[field.optionStoreKey] = normalizeOptions(store[field.optionStoreKey], [], [nextValue]);
      touchOptionStore(field.optionStoreKey);
    }
    contract.fields[fieldKey] = nextValue;
    contract.updatedAt = nowIso();
    openOptionPanelKey = "";
    saveStore(true);
    showValidation([]);
    clearAdminEditingSession({ force: true, clearPending: true });
    renderContractList();
    renderPreview();
    renderForm({ force: true, ignoreDefer: true });
  }

  function renderPreview() {
    const contract = currentContract();
    if (!contract) {
      renderMobileActions(null);
      return;
    }
    const status = STATUS[contract.status] || STATUS.draft;
    document.getElementById("previewMeta").textContent = `${status.label} · ${contract.fields.brand || "未命名合同"}`;
    document.getElementById("publishBtn").disabled = contract.status !== "draft";
    document.getElementById("revokeBtn").disabled = !["published", "confirmed"].includes(contract.status);
    const shareBox = document.getElementById("shareBox");
    if (["published", "confirmed", "signed"].includes(contract.status)) {
      shareBox.hidden = false;
      renderShareLink(contract);
      if (hasAdminCloudConfig()) queueShareLinkValidation(contract);
    } else {
      shareBox.hidden = true;
    }
    renderMobileActions(contract);
  }

  function renderContractPreviewContent(contract, options = {}) {
    const preview = document.getElementById("contractPreview");
    const force = Boolean(options && options.force);
    const ignoreDefer = Boolean(options && options.ignoreDefer);
    if (!contract) {
      preview.innerHTML = "";
      lastContractPreviewIdentity = "";
      pendingAdminPreviewRefresh = false;
      partyASignatureCanvasContractId = "";
      clearAdminEditingSession({ force: true, clearPending: true });
      return;
    }
    if (!ignoreDefer && shouldDeferPartyASignaturePreview(contract)) {
      pendingAdminPreviewRefresh = true;
      return;
    }
    capturePartyASignatureDraftFromDom();
    const isDraft = contract.status === "draft";
    if (!isDraft) {
      clearAdminEditingSession({ force: true, clearPending: true });
    }
    const nextIdentity = buildContractPreviewIdentity(contract);
    if (!force && !pendingAdminPreviewRefresh && nextIdentity === lastContractPreviewIdentity) return;
    preview.innerHTML = isDraft
      ? renderEditableContractDocument(contract)
      : renderContractDocument(contract);
    lastContractPreviewIdentity = nextIdentity;
    pendingAdminPreviewRefresh = false;
    if (isDraft) {
      setupPartyASignatureCanvas();
      restoreInlineClauseEditorFocus();
    } else {
      partyASignatureCanvasContractId = "";
      activeInlineClauseToken = "";
      pendingInlineClauseFocusToken = "";
    }
  }

  function buildContractPreviewIdentity(contract) {
    if (!contract) return "";
    const activeVersion = contract.status === "draft" ? activeClauseVersion() : null;
    return JSON.stringify({
      id: contract.id || "",
      status: contract.status || "",
      updatedAt: contract.updatedAt || "",
      activeView,
      optionPanel: openOptionPanelKey,
      fields: contract.fields || {},
      signatureDraft: getPartyASignatureDraft(contract),
      clauseVersionId: activeVersion ? activeVersion.id : getIn(contract, ["snapshot", "clauseVersion"]) || "",
      clauseVersionUpdatedAt: activeVersion ? activeVersion.updatedAt : "",
      clauseVersionName: activeVersion ? activeVersion.version : "",
    });
  }

  function isContractFormInteractionActive() {
    const activeElement = document.activeElement;
    if (!activeElement || !getClosest(activeElement, "#contractForm")) return false;
    return activeElement.id === "partyASignatureCanvas"
      || ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName);
  }

  function lockAdminPreview(durationMs = 1200) {
    adminPreviewFreezeUntil = Math.max(adminPreviewFreezeUntil, Date.now() + Math.max(0, durationMs));
  }

  function scheduleAdminPreviewRefresh(delayMs = 180) {
    if (adminPreviewRefreshTimer) clearTimeout(adminPreviewRefreshTimer);
    adminPreviewRefreshTimer = window.setTimeout(() => {
      adminPreviewRefreshTimer = 0;
      const contract = currentContract();
      if (!contract) {
        renderForm({ force: true });
        return;
      }
      if (shouldDeferPartyASignaturePreview(contract)) {
        pendingAdminPreviewRefresh = true;
        return;
      }
      renderForm({ force: true });
    }, Math.max(80, delayMs));
  }

  function contractFormFreezeDuration(target) {
    if (!target || !getClosest(target, "#contractForm")) return 0;
    if (target.id === "partyASignatureCanvas") return 2400;
    if (target.type === "date") return 12000;
    if (target.tagName === "TEXTAREA") return 5200;
    if (target.tagName === "SELECT") return 4200;
    if (target.tagName === "INPUT") return 4200;
    return 3200;
  }

  function handleContractFormPointerDown(event) {
    const duration = contractFormFreezeDuration(event.target);
    if (!duration) return;
    beginAdminEditingSession(event.target, duration);
    lockAdminPreview(duration);
  }

  function handleContractFormFocusIn(event) {
    const duration = contractFormFreezeDuration(event.target);
    if (!duration) return;
    beginAdminEditingSession(event.target, duration);
    lockAdminPreview(duration);
  }

  function handleContractFormFocusOut(event) {
    const inlineEditor = getClosest(event.target, "[data-inline-clause-editor]");
    if (inlineEditor) {
      const nextTarget = event.relatedTarget;
      if (nextTarget && getClosest(nextTarget, "[data-inline-clause-editor]") === inlineEditor) return;
      window.setTimeout(() => {
        const active = document.activeElement;
        if (active && getClosest(active, "[data-inline-clause-editor]") === inlineEditor) return;
        closeInlineClauseEditor({ forceRefresh: true });
      }, 0);
      return;
    }
    const nextTarget = event.relatedTarget;
    if (nextTarget && getClosest(nextTarget, "#contractForm")) return;
    pendingAdminPreviewRefresh = true;
    const target = event.target;
    const releaseDelay = contractFormFreezeDuration(target) || 1600;
    if (target && target.type === "date" && adminDatePickerFieldKey) {
      adminEditingSessionUntil = Math.max(adminEditingSessionUntil, Date.now() + releaseDelay);
      lockAdminPreview(releaseDelay);
    } else {
      adminEditingSessionUntil = Math.max(adminEditingSessionUntil, Date.now() + 1200);
    }
    scheduleAdminEditingSessionRelease(releaseDelay + 180);
  }

  function resolveAdminEditingFieldKey(target) {
    if (!target) return "";
    const optionManager = getClosest(target, "[data-option-manager]");
    return String(
      target.dataset.fieldKey
      || target.dataset.optionNew
      || target.dataset.optionToggle
      || target.dataset.optionAdd
      || target.dataset.optionSelect
      || target.dataset.optionDelete
      || (optionManager && optionManager.dataset.optionManager)
      || target.id
      || target.name
      || target.type
      || "form"
    ).trim();
  }

  function beginAdminEditingSession(target, durationMs = 1600) {
    const contract = currentDraftContract();
    if (!contract || !target || !getClosest(target, "#contractForm")) return;
    adminEditingContractId = partyASignatureDraftKey(contract);
    adminEditingFieldKey = resolveAdminEditingFieldKey(target);
    const effectiveDuration = Math.max(contractFormFreezeDuration(target), durationMs, 1600);
    adminEditingSessionUntil = Math.max(adminEditingSessionUntil, Date.now() + effectiveDuration);
    if (target.type === "date") {
      adminDatePickerFieldKey = adminEditingFieldKey;
    }
    if (adminEditingReleaseTimer) {
      clearTimeout(adminEditingReleaseTimer);
      adminEditingReleaseTimer = 0;
    }
  }

  function clearAdminEditingSession(options = {}) {
    if (!options.keepTimers && adminEditingReleaseTimer) {
      clearTimeout(adminEditingReleaseTimer);
      adminEditingReleaseTimer = 0;
    }
    adminEditingContractId = "";
    adminEditingFieldKey = "";
    adminEditingSessionUntil = 0;
    if (!options.keepDatePickerField) adminDatePickerFieldKey = "";
    if (options.clearPending) {
      pendingAdminPreviewRefresh = false;
    }
  }

  function scheduleAdminEditingSessionRelease(delayMs = 280) {
    if (adminEditingReleaseTimer) clearTimeout(adminEditingReleaseTimer);
    adminEditingReleaseTimer = window.setTimeout(() => {
      adminEditingReleaseTimer = 0;
      releaseAdminEditingSessionIfIdle();
    }, Math.max(120, delayMs));
  }

  function releaseAdminEditingSessionIfIdle() {
    const contract = currentDraftContract();
    if (!contract) {
      clearAdminEditingSession({ force: true });
      return;
    }
    if (isContractFormInteractionActive()) return;
    const now = Date.now();
    if (now < adminEditingSessionUntil) {
      scheduleAdminEditingSessionRelease(adminEditingSessionUntil - now + 120);
      return;
    }
    const shouldRefresh = pendingAdminPreviewRefresh;
    clearAdminEditingSession();
    if (shouldRefresh) {
      scheduleAdminPreviewRefresh(180);
    }
  }

  function hasActiveAdminEditingSession(contract) {
    const contractId = partyASignatureDraftKey(contract);
    return Boolean(
      contractId
      && adminEditingContractId === contractId
      && (Date.now() < adminEditingSessionUntil || isContractFormInteractionActive())
    );
  }

  function hasActiveAdminDatePickerSession(contract) {
    const contractId = partyASignatureDraftKey(contract);
    return Boolean(
      contractId
      && adminEditingContractId === contractId
      && adminDatePickerFieldKey
      && (Date.now() < adminEditingSessionUntil || Date.now() < adminPreviewFreezeUntil)
    );
  }

  function hasUnsavedPartyASignatureDraft(contract) {
    return Boolean(getPartyASignatureDraft(contract));
  }

  function renderSigner() {
    const contract = signerContract();
    const status = document.getElementById("signerStatus");
    const preview = document.getElementById("signerPreview");
    const meta = document.getElementById("signerMeta");
    const signerNameInput = document.getElementById("signerName");
    const confirmCheckbox = document.getElementById("confirmCheckbox");
    const signerUpload = document.getElementById("signerUpload");
    const submitButton = document.getElementById("submitSignBtn");
    const canSign = contract && ["published", "confirmed"].includes(contract.status) && !signerSubmitInProgress;
    if (!contract) {
      status.textContent = signerRemoteLoading
        ? "正在加载线上合同..."
        : signerLinkWarning || "暂无可签署合同。请先由甲方发布合同，或打开乙方签署链接。";
      preview.innerHTML = `
        <div class="signer-loading-card">
          <strong>${escapeHtml(CONTRACT_TITLE)}</strong>
          <p>${escapeHtml(status.textContent)}</p>
        </div>
      `;
      meta.textContent = `${CONTRACT_TITLE} · 待发布`;
      signerNameInput.value = "";
    } else {
      const statusInfo = STATUS[contract.status] || STATUS.draft;
      status.textContent = `当前状态：${CONTRACT_TITLE} · ${statusInfo.label}`;
      preview.innerHTML = renderContractDocument(contract);
      meta.textContent = `${CONTRACT_TITLE} · ${statusInfo.label}`;
      if ((!signerNameInput.value || contract.status === "signed") && contract.signature && contract.signature.signerName) {
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
    submitButton.disabled = !canSign;
    submitButton.textContent = signerSubmitInProgress ? "正在安全提交..." : "提交签署";
    document.getElementById("clearSignBtn").disabled = !canSign;
    document.getElementById("signerPrintBtn").disabled = !contract;
    renderSignerUploadState(contract);
    resizeSignatureCanvas();
  }

function renderClauses(options = {}) {
    const version = activeClauseVersion();
    const templateOptions = normalizedClauseTemplateOptions();
    const canDeleteTemplate = templateOptions.length > 1;
    document.getElementById("clauseMeta").textContent = `${version.version} · ${formatDateTime(version.updatedAt)} · ${version.maintainer}`;
    document.getElementById("clauseTemplateList").innerHTML = templateOptions.map((item) => `
      <div class="clause-template-row${item.id === version.id ? " is-active" : ""}">
        <button
          class="clause-template-button${item.id === version.id ? " is-active" : ""}"
          type="button"
          data-clause-template-id="${escapeAttr(item.id)}"
        >
          <span class="clause-template-title">
            <strong>${escapeHtml(item.version)}</strong>
            ${item.id === version.id ? '<span class="clause-template-badge">当前默认模板</span>' : ""}
          </span>
          <span class="clause-template-meta">${escapeHtml(formatDateTime(item.updatedAt))} · ${escapeHtml(item.maintainer)}</span>
        </button>
        <button
          class="clause-template-delete"
          type="button"
          data-clause-template-delete="${escapeAttr(item.id)}"
          ${canDeleteTemplate ? "" : "disabled"}
          title="${canDeleteTemplate ? "删除模板" : "至少保留一份模板"}"
        >删除</button>
      </div>
    `).join("");
    renderClauseEditorContent(version, options);
    return;
    document.getElementById("clauseList").innerHTML = draft.sections.map((clause, index) => `
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

  function renderClauseEditorContent(version, options = {}) {
    const force = Boolean(options && options.force);
    const ignoreDefer = Boolean(options && options.ignoreDefer);
    if (!version) {
      document.getElementById("clauseVersionName").value = "";
      document.getElementById("clauseList").innerHTML = "";
      lastClauseEditorIdentity = "";
      pendingClauseViewRefresh = false;
      clearClauseEditingSession({ force: true, clearPending: true });
      return;
    }
    if (!ignoreDefer && shouldDeferClauseViewRefresh(version)) {
      pendingClauseViewRefresh = true;
      return;
    }
    const draft = clauseEditorDraft(version);
    const tailSections = normalizeTailClauseSections(draft.sections, DEFAULT_CLAUSES.slice(2));
    const nextIdentity = buildClauseEditorIdentity(version, draft);
    if (!force && !pendingClauseViewRefresh && nextIdentity === lastClauseEditorIdentity) return;
    document.getElementById("clauseVersionName").value = draft.versionName;
    document.getElementById("clauseList").innerHTML = `
      ${tailSections.map((clause, index) => `
        <article class="clause-item" data-clause-editable="true">
          <label class="field is-wide">
            <span>条款标题</span>
            <input data-clause-index="${index}" data-clause-field="title" type="text" value="${escapeAttr(clause.title)}" />
          </label>
          <label class="field is-wide">
            <span>条款内容</span>
            <textarea class="clause-textarea" data-clause-index="${index}" data-clause-field="body">${escapeHtml(clause.body.join("\n"))}</textarea>
          </label>
        </article>
      `).join("")}
      <div class="clause-actions">
        <button class="ghost-button clause-add-button" type="button" data-clause-add="tail">新增条款</button>
      </div>
    `;
    lastClauseEditorIdentity = nextIdentity;
    pendingClauseViewRefresh = false;
  }

  function handleClauseEditorInput(event) {
    const version = activeClauseVersion();
    if (!version) return;
    beginClauseEditingSession(event.target, clauseEditorFreezeDuration(event.target) || 2200);
    clauseEditorDraftByVersionId.set(version.id, collectClauseEditorDraft(version));
  }

  function handleClauseTemplateClick(event) {
    const addClauseButton = getClosest(event.target, "[data-clause-add]");
    if (addClauseButton) {
      addClauseTemplateSection();
      return;
    }
    const deleteButton = getClosest(event.target, "[data-clause-template-delete]");
    if (deleteButton) {
      deleteClauseTemplate(deleteButton.dataset.clauseTemplateDelete || "");
      return;
    }
    const button = getClosest(event.target, "[data-clause-template-id]");
    if (!button) return;
    const versionId = String(button.dataset.clauseTemplateId || "").trim();
    if (!versionId || versionId === store.activeClauseVersionId) return;
    captureClauseEditorDraftFromDom();
    clearClauseEditingSession({ force: true, clearPending: true });
    store.activeClauseVersionId = versionId;
    saveStore(true, { reason: "switch-clause-template" });
    renderClauses({ force: true, ignoreDefer: true });
    renderTopState();
    const next = activeClauseVersion();
    document.getElementById("syncState").textContent = `已切换默认模板 ${next.version}`;
  }

  function deleteClauseTemplate(templateId) {
    const targetId = String(templateId || "").trim();
    if (!targetId) return;
    const versions = normalizeClauseVersions(store.clauseVersions);
    if (versions.length <= 1) {
      document.getElementById("syncState").textContent = "至少保留一份模板";
      return;
    }
    const target = versions.find((item) => item.id === targetId);
    if (!target) return;
    if (!window.confirm(`确认删除模板“${target.version}”？已发布合同不会受影响。`)) return;
    captureClauseEditorDraftFromDom();
    const remaining = versions.filter((item) => item.id !== targetId);
    store.clauseVersions = remaining;
    clauseEditorDraftByVersionId.delete(targetId);
    const deletingActive = store.activeClauseVersionId === targetId;
    if (deletingActive) {
      const fallback = remaining
        .slice()
        .sort((left, right) => latestTimestamp([right.updatedAt]) - latestTimestamp([left.updatedAt]))[0];
      store.activeClauseVersionId = fallback ? fallback.id : "";
      clearClauseEditingSession({ force: true, clearPending: true });
    }
    saveStore(true, { reason: "delete-clause-template", immediate: true });
    renderClauses({ force: true, ignoreDefer: true });
    renderTopState();
    const activeVersion = activeClauseVersion();
    document.getElementById("syncState").textContent = deletingActive
      ? `已删除模板 ${target.version}，已切换到 ${activeVersion.version}`
      : `已删除模板 ${target.version}`;
  }

  function addClauseTemplateSection() {
    const version = activeClauseVersion();
    if (!version) return;
    const draft = collectClauseEditorDraft(version);
    const tailSections = normalizeTailClauseSections(draft.sections, DEFAULT_CLAUSES.slice(2));
    const nextIndex = tailSections.length;
    tailSections.push(makeDefaultTailClauseSection(nextIndex));
    const nextDraft = {
      versionName: draft.versionName,
      sections: [...clone(DEFAULT_CLAUSES.slice(0, 2)), ...tailSections],
    };
    clauseEditorDraftByVersionId.set(version.id, nextDraft);
    clearClauseEditingSession({ force: true, clearPending: true });
    renderClauseEditorContent(version, { force: true, ignoreDefer: true });
    window.requestAnimationFrame(() => {
      const target = document.querySelector(`.clause-item[data-clause-editable="true"]:nth-of-type(${nextIndex + 1}) [data-clause-field="title"]`);
      if (!target) return;
      target.focus();
      if (typeof target.select === "function") target.select();
    });
    document.getElementById("syncState").textContent = `已新增${buildDefaultTailClauseTitle(nextIndex)}`;
  }

  function saveClauseVersion() {
    const previous = activeClauseVersion();
    const draft = collectClauseEditorDraft(previous);
    const next = {
      id: randomToken(12),
      version: draft.versionName || bumpClauseVersion(previous.version),
      maintainer: "甲方",
      updatedAt: nowIso(),
      sections: draft.sections,
    };
    store.clauseVersions.push(next);
    store.activeClauseVersionId = next.id;
    clauseEditorDraftByVersionId.set(next.id, clone(draft));
    clearClauseEditingSession({ force: true, clearPending: true });
    saveStore(true, { reason: "save-clause-template", immediate: true });
    renderClauses({ force: true, ignoreDefer: true });
    renderTopState();
    document.getElementById("syncState").textContent = `已保存新模板 ${next.version}`;
  }

  function renderTopState() {
    const contract = signerToken ? signerContract() : currentContract();
    const status = contract ? ((STATUS[contract.status] && STATUS[contract.status].label) || "草稿") : "无合同";
    let syncLabel = "本地模式";
    if (signerWorkspaceId && signerToken) {
      syncLabel = signerRemoteLoading ? "线上合同加载中" : "线上合同";
    } else if (remoteSyncState.lastError) {
      syncLabel = "云端同步异常";
    } else if (isAdminCloudReady() && remoteSyncState.connected) {
      syncLabel = remoteSyncState.syncing ? "云端同步中" : "云端已同步";
    } else if (hasSupabaseClientConfig()) {
      syncLabel = adminSession ? "云端连接中" : "请登录云端";
    }
    document.getElementById("syncState").textContent = `${syncLabel} · ${status}`;
  }

  function renderEditableContractDocument(contract) {
    if (contract.status !== "draft") return renderContractDocument(contract);
    const fields = contract.fields;
    const clauses = composeEditableContractClauses(contract);
    const dynamicClauses = clone(DEFAULT_CLAUSES.slice(0, 2));
    const tailClauses = clauses.slice(2);
    const editable = (key) => renderInlineField(contract, fieldConfig(key), false);
    const watermark = formatContractWatermark(fields.brand);
    return `
      <article class="contract-document editable-contract">
        ${renderContractPageShell(watermark, `
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
          ${dynamicClauses.map((clause) => renderEditableDynamicClauseSection(clause, contract)).join("")}
          ${tailClauses.map((clause) => renderClauseSection(clause, fields)).join("")}
          <section class="editable-block signature-edit-block">
            <h3>甲方签署</h3>
            <div class="embedded-grid two-col">
              ${editable("partyASignDate")}
              ${editable("partyASignature")}
            </div>
            ${editable("partyASignaturePad")}
          </section>
          ${renderSignatureBlock(contract, fields)}
        `)}
      </article>
    `;
  }

  function fieldConfig(key) {
    const aliases = {
      partyASignaturePad: { key: "partyASignature", label: "手写签名", type: "signature" },
    };
    if (aliases[key]) return aliases[key];
    const baseField = FIELD_GROUPS.flatMap((group) => group.fields).find((field) => field.key === key) || { key, label: key };
    return {
      ...baseField,
      label: FIELD_LABEL_OVERRIDES[key] || baseField.label,
      previewHint: FIELD_PREVIEW_HINTS[key] || baseField.previewHint || "",
    };
  }

  function renderInlineField(contract, field, locked) {
    return `<div class="embedded-field${field.wide || field.type === "textarea" || field.type === "signature" ? " is-wide" : ""}">
      <span class="embedded-label">${field.label}${field.required ? '<i class="required">*</i>' : ""}</span>
      ${renderFieldControl(contract, field, locked)}
      ${field.previewHint ? `<span class="field-hint">${escapeHtml(field.previewHint)}</span>` : ""}
    </div>`;
  }

  function renderContractPageShell(watermark, content) {
    return `
      <section class="contract-page">
        <div class="contract-watermark-layer" aria-hidden="true">
          <img class="contract-watermark-image" src="${escapeAttr(buildContractWatermarkSvg(watermark))}" alt="" />
        </div>
        <div class="contract-page-content">${content}</div>
      </section>
    `;
  }

  function renderContractDocument(contract) {
    const fields = renderFields(contract) || getIn(contract, ["fields"]) || {};
    const clauses = renderClausesForContract(contract);
    const watermark = formatContractWatermark(fields.brand);
    const showLegacyReviewRow = !fields.draftSubmitDeadlineDate && (fields.firstReviewDate || fields.finalReviewDate || fields.reviewDate);
    return `
      <article class="contract-document">
        ${renderContractPageShell(watermark, `
          <h1 class="doc-title">${CONTRACT_TITLE}</h1>
          <section class="doc-section">
            <h3>一、合作内容</h3>
            <table class="info-table">
              <tr><th>品牌</th><td>${escapeHtml(fields.brand || "-")}</td><th>博主名称</th><td>${escapeHtml(fields.creatorName || "-")}</td></tr>
              <tr><th>平台</th><td>${escapeHtml(fields.platform || "-")}</td><th>账号</th><td>${escapeHtml(fields.platformAccount || "-")}</td></tr>
              <tr><th>联系电话</th><td>${escapeHtml(fields.partyBPhone || "-")}</td><th>寄样信息</th><td>${escapeHtml(fields.sampleShippingInfo || "-")}</td></tr>
              ${showLegacyReviewRow ? `<tr><th>初稿时间</th><td>${escapeHtml(formatDateCn(fields.firstReviewDate || fields.reviewDate) || "-")}</td><th>终稿时间</th><td>${escapeHtml(formatDateCn(fields.finalReviewDate || fields.reviewDate) || "-")}</td></tr>` : ""}
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
          ${clauses.map((clause) => renderClauseSection(clause, fields)).join("")}
          ${renderSignatureBlock(contract, fields)}
        `)}
      </article>
    `;
  }

  function renderClauseSection(clause, fields = {}) {
    const bodyLines = resolveDynamicClauseBody(clause, fields);
    return `
      <section class="doc-section">
        <h3>${escapeHtml(resolveClauseTemplateText(clause.title, fields))}</h3>
        ${bodyLines.map((line) => `<p>${escapeHtml(resolveClauseTemplateText(line, fields))}</p>`).join("")}
      </section>
    `;
  }

  function renderClausePreviewCard(clause, fields = {}, options = {}) {
    if (!clause) return "";
    const resolvedTitle = resolveClauseTemplateText(clause.title, fields);
    const previewTitle = options.title || `${resolvedTitle}（预览）`;
    const previewLead = options.lead || "高亮内容会随上方字段实时变化。";
    const bodyLines = resolveDynamicClauseBody(clause, fields);
    return `
      <article class="clause-item clause-preview-item">
        <div class="clause-preview-head">
          <h3>${escapeHtml(previewTitle)}</h3>
          <p>${escapeHtml(previewLead)}</p>
        </div>
        ${bodyLines.map((line) => `<p>${renderClausePreviewLine(line, fields)}</p>`).join("")}
      </article>
    `;
  }

  function renderClausePreviewLine(line, fields = {}) {
    const source = String(line || "");
    const pattern = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    if (!pattern.test(source)) return escapeHtml(resolveClauseTemplateText(source, fields));
    pattern.lastIndex = 0;
    let html = "";
    let cursor = 0;
    let match;
    while ((match = pattern.exec(source))) {
      html += escapeHtml(source.slice(cursor, match.index));
      html += renderClausePreviewValue(match[1], fields);
      cursor = match.index + match[0].length;
    }
    html += escapeHtml(source.slice(cursor));
    return html;
  }

  function renderClausePreviewValue(token, fields = {}) {
    const value = clauseTemplateValue(token, fields) || "未填写";
    return `<span class="clause-token-highlight">${escapeHtml(value)}</span>`;
  }

  function renderEditableDynamicClauseSection(clause, contract) {
    const fields = renderFields(contract) || getIn(contract, ["fields"]) || {};
    const bodyLines = resolveDynamicClauseBody(clause, fields);
    return `
      <section class="doc-section doc-section-editable-clause">
        <h3>${escapeHtml(resolveClauseTemplateText(clause.title, fields))}</h3>
        ${isPaymentClauseTitle(clause.title) ? renderPaymentModeSwitcher(contract, fields) : ""}
        ${bodyLines.map((line) => `<p>${renderEditableDynamicClauseLine(line, contract, fields)}</p>`).join("")}
      </section>
    `;
  }

  function renderEditableDynamicClauseLine(line, contract, fields = {}) {
    const source = String(line || "");
    const pattern = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    if (!pattern.test(source)) return escapeHtml(resolveClauseTemplateText(source, fields));
    pattern.lastIndex = 0;
    let html = "";
    let cursor = 0;
    let match;
    while ((match = pattern.exec(source))) {
      html += escapeHtml(source.slice(cursor, match.index));
      html += renderEditableClauseValue(match[1], contract, fields);
      cursor = match.index + match[0].length;
    }
    html += escapeHtml(source.slice(cursor));
    return html;
  }

  function renderEditableClauseValue(token, contract, fields = {}) {
    if (activeInlineClauseToken === token) {
      return renderInlineClauseEditor(contract, token);
    }
    const value = clauseTemplateValue(token, fields) || "未填写";
    if (!isInlineClauseTokenEditable(token)) {
      return `<span class="clause-token-highlight">${escapeHtml(value)}</span>`;
    }
    return `<button class="clause-token-button" type="button" data-inline-clause-token="${escapeAttr(token)}">${escapeHtml(value)}</button>`;
  }

  function isInlineClauseTokenEditable(token) {
    return inlineClauseFieldKeys(token).length > 0;
  }

  function inlineClauseFieldKeys(token) {
    const mapping = {
      draftSubmitDeadline: ["draftSubmitDeadlineDate", "draftSubmitDeadlineTime"],
      reviewContact: ["reviewContact"],
      reviewFeedbackWorkdays: ["reviewFeedbackWorkdays"],
      sampleFeedbackNote: ["sampleFeedbackNote"],
      finalRevisionWorkdays: ["finalRevisionWorkdays"],
      finalPublishDeadline: ["publishDate", "publishTime"],
      rescheduleNoticeHours: ["rescheduleNoticeHours"],
      serviceFee: ["promotionServiceFee"],
      paymentModeLabel: ["paymentMode"],
      maintenanceDays: ["maintenanceDays"],
      prepaymentWorkdays: ["prepaymentWorkdays"],
      prepaymentPercent: ["prepaymentPercent"],
      finalPaymentAfterPublishDays: ["finalPaymentAfterPublishDays"],
      finalPaymentWorkdays: ["finalPaymentWorkdays"],
      finalPaymentPercent: ["finalPaymentPercent"],
      oneTimePaymentWorkdays: ["oneTimePaymentWorkdays"],
      performanceMetric: ["performanceMetric"],
      deductionScenario: ["deductionScenario"],
    };
    return mapping[token] || [];
  }

  function renderInlineClauseEditor(contract, token) {
    const fieldKeys = inlineClauseFieldKeys(token);
    if (!fieldKeys.length) {
      const fields = renderFields(contract) || getIn(contract, ["fields"]) || {};
      return `<span class="clause-token-highlight">${escapeHtml(clauseTemplateValue(token, fields) || "未填写")}</span>`;
    }
    return `
      <span class="inline-clause-editor${fieldKeys.length > 1 ? " is-compound" : ""}" data-inline-clause-editor="${escapeAttr(token)}">
        ${fieldKeys.map((fieldKey) => renderInlineClauseEditorField(contract, fieldKey)).join("")}
        <button class="inline-clause-editor-close" type="button" data-inline-clause-close="${escapeAttr(token)}">完成</button>
      </span>
    `;
  }

  function renderInlineClauseEditorField(contract, fieldKey) {
    const field = fieldConfig(fieldKey);
    const value = contract.fields[fieldKey] || "";
    if (field.type === "textarea") {
      return `<textarea class="inline-clause-editor-control is-textarea" data-field-key="${field.key}" rows="3">${escapeHtml(value)}</textarea>`;
    }
    if (field.type === "select") {
      const options = (field.options || []).map((option) => {
        const normalizedOption = normalizeSelectOption(option);
        const selected = normalizedOption.value === String(value) ? "selected" : "";
        return `<option value="${escapeAttr(normalizedOption.value)}" ${selected}>${escapeHtml(normalizedOption.label)}</option>`;
      }).join("");
      return `<select class="inline-clause-editor-control" data-field-key="${field.key}">${options}</select>`;
    }
    return `
      <input
        class="inline-clause-editor-control"
        data-field-key="${field.key}"
        type="${field.type || "text"}"
        value="${escapeAttr(value)}"
        placeholder="${escapeAttr(field.label || "")}"
      />
    `;
  }

  function resolveClauseTemplateText(text, fields = {}) {
    const value = String(text || "");
    return value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, token) => clauseTemplateValue(token, fields));
  }

  function clauseTemplateValue(token, fields = {}) {
    const serviceFeeBase = promotionServiceFeeValue(fields);
    const values = {
      draftSubmitDeadline: formatClauseDeadline(fields.draftSubmitDeadlineDate, fields.draftSubmitDeadlineTime),
      reviewContact: formatWrappedText(fields.reviewContact),
      reviewFeedbackWorkdays: formatWorkdayText(fields.reviewFeedbackWorkdays),
      sampleFeedbackNote: fields.sampleFeedbackNote || DEFAULT_FIELDS.sampleFeedbackNote,
      finalRevisionWorkdays: formatWorkdayText(fields.finalRevisionWorkdays),
      finalPublishDeadline: formatClauseDeadline(fields.publishDate, fields.publishTime),
      publishPlatform: fields.platform || DEFAULT_FIELDS.platform,
      rescheduleNoticeHours: formatHourText(fields.rescheduleNoticeHours),
      serviceFee: formatMoney(serviceFeeBase),
      serviceFeeUpper: fields.promotionServiceFeeUpper || moneyToChinese(serviceFeeBase) || DEFAULT_FIELDS.promotionServiceFeeUpper,
      paymentModeLabel: paymentModeLabel(fields.paymentMode),
      maintenanceDays: normalizeDurationText(fields.maintenanceDays, "天内"),
      prepaymentWorkdays: formatWorkdayText(fields.prepaymentWorkdays),
      prepaymentPercent: formatPercentText(fields.prepaymentPercent),
      prepaymentAmount: formatMoney(calculatePercentAmount(serviceFeeBase, fields.prepaymentPercent)),
      finalPaymentAfterPublishDays: normalizeDurationText(fields.finalPaymentAfterPublishDays, "天内"),
      finalPaymentWorkdays: formatWorkdayText(fields.finalPaymentWorkdays),
      finalPaymentPercent: formatPercentText(fields.finalPaymentPercent),
      finalPaymentAmount: formatMoney(calculatePercentAmount(serviceFeeBase, fields.finalPaymentPercent)),
      oneTimePaymentWorkdays: formatWorkdayText(fields.oneTimePaymentWorkdays),
      performanceMetric: fields.performanceMetric || DEFAULT_FIELDS.performanceMetric,
      deductionScenario: fields.deductionScenario || DEFAULT_FIELDS.deductionScenario,
    };
    return values[token] || "";
  }

  function resolveDynamicClauseBody(clause, fields = {}) {
    if (isPaymentClauseTitle(clause && clause.title)) {
      return buildPaymentClauseBody(fields);
    }
    return Array.isArray(clause && clause.body) ? clause.body : [];
  }

  function buildPaymentClauseBody(fields = {}) {
    const paymentMode = normalizePaymentMode(fields.paymentMode);
    const body = [
      "（一）费用构成",
      "一次性推广服务费：人民币{{serviceFee}}（大写：{{serviceFeeUpper}}），包含内容创作、修改、发布及发布后{{maintenanceDays}}评论维护服务，其他额外费用另算。",
      "样品处理：样品为合作道具，合作结束后归乙方所有。",
      "（二）支付方式",
    ];
    if (paymentMode === "one_time") {
      body.push("一次性付款：乙方按约定时间完成内容发布后{{oneTimePaymentWorkdays}}，甲方一次性支付推广服务费（即人民币{{serviceFee}}）。");
    } else {
      body.push("预付款：本合同签订后{{prepaymentWorkdays}}，甲方支付服务费的{{prepaymentPercent}}（即人民币{{prepaymentAmount}}）作为履约保证金；");
      body.push("尾款：乙方按约定时间完成内容发布，且发布后{{finalPaymentAfterPublishDays}}内数据达标（达标标准：{{performanceMetric}}），后{{finalPaymentWorkdays}}内，甲方支付剩余{{finalPaymentPercent}}服务费（即人民币{{finalPaymentAmount}}）；");
    }
    body.push("扣付情形：{{deductionScenario}}");
    return body;
  }

  function isPaymentClauseTitle(title) {
    const text = String(title || "").trim();
    return text === "四、推广费用与支付";
  }

  function paymentModeLabel(value) {
    return normalizePaymentMode(value) === "one_time" ? "一次性付款" : "分期付款";
  }

  function normalizePaymentMode(value) {
    return String(value || "").trim() === "one_time" ? "one_time" : "installment";
  }

  function renderPaymentModeSwitcher(contract, fields = {}) {
    const currentMode = normalizePaymentMode(fields.paymentMode);
    const canEdit = contract && contract.status === "draft";
    const options = [
      { value: "installment", label: "分期付款" },
      { value: "one_time", label: "一次性付款" },
    ];
    return `
      <div class="payment-mode-switcher" data-payment-mode-switcher>
        <span class="payment-mode-label">支付方式</span>
        <div class="payment-mode-actions">
          ${options.map((option) => {
            const active = option.value === currentMode;
            if (!canEdit) {
              return `<span class="payment-mode-chip${active ? " is-active" : ""}">${escapeHtml(option.label)}</span>`;
            }
            return `
              <button
                class="payment-mode-chip${active ? " is-active" : ""}"
                type="button"
                data-payment-mode-select="${escapeAttr(option.value)}"
              >${escapeHtml(option.label)}</button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function selectPaymentMode(mode) {
    const contract = currentContract();
    if (!contract || contract.status !== "draft") return;
    const nextMode = normalizePaymentMode(mode);
    if (normalizePaymentMode(contract.fields.paymentMode) === nextMode) return;
    beginAdminEditingSession(document.getElementById("contractForm"), 6000);
    contract.fields.paymentMode = nextMode;
    contract.updatedAt = nowIso();
    saveStore(true);
    renderForm({ force: true, ignoreDefer: true });
    renderContractList();
    renderMonthlyStats();
  }

  function formatClauseDeadline(dateValue, timeValue) {
    const dateText = formatDateCn(dateValue) || "";
    const timeText = normalizeTimeText(timeValue);
    if (dateText && timeText) return `【${dateText}${timeText}前】`;
    if (dateText) return `【${dateText}前】`;
    if (timeText) return `【${timeText}前】`;
    return "【待甲方填写】";
  }

  function formatWrappedText(value) {
    const text = String(value || "").trim();
    return text ? `【${text}】` : "【待甲方填写】";
  }

  function normalizeTimeText(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    const match = text.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return text;
    const [, hour, minute] = match;
    return `${Number(hour)}时${minute === "00" ? "" : minute.padStart(2, "0")}分`;
  }

  function normalizeDurationText(value, suffix = "") {
    const text = String(value || "").trim();
    if (!text) return "";
    return /天|小时|工作日|%/.test(text) ? text : `${text}${suffix}`;
  }

  function formatWorkdayText(value) {
    return normalizeDurationText(value, "个工作日内") || "待甲方填写";
  }

  function formatHourText(value) {
    return normalizeDurationText(value, "小时") || "待甲方填写";
  }

  function formatPercentText(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return text.includes("%") ? text : `${text}%`;
  }

  function promotionServiceFeeValue(fields = {}) {
    const value = String(fields.promotionServiceFee == null ? "" : fields.promotionServiceFee).trim();
    return value || fields.price || DEFAULT_FIELDS.price;
  }

  function calculatePercentAmount(price, percent) {
    const amount = Number(price || 0);
    const ratioText = String(percent || "").replace(/%/g, "").trim();
    const ratio = Number(ratioText);
    if (!Number.isFinite(amount) || !Number.isFinite(ratio)) return 0;
    return Math.round((amount * ratio) * 100) / 10000;
  }

  function renderSignatureBlock(contract, fields) {
    const signature = contract.signature || getIn(contract, ["snapshot", "signature"]) || {};
    const partyASignatureValue = getIn(contract, ["snapshot", "fields", "partyASignature"])
      || getIn(contract, ["fields", "partyASignature"])
      || fields.partyASignature
      || "";
    const partyADateValue = getIn(contract, ["snapshot", "fields", "partyASignDate"])
      || getIn(contract, ["fields", "partyASignDate"])
      || fields.partyASignDate
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
    beginAdminEditingSession(event.target, event.target.type === "date" ? 12000 : 6000);
    if (event.target.type === "date") lockAdminPreview(12000);
    if (event.target.dataset.retentionLongTerm === "true") {
      contract.fields[key] = event.target.checked ? "长期" : "";
      const retentionControl = getClosest(event.target, ".retention-control");
      const dateInput = retentionControl ? retentionControl.querySelector('input[type="date"]') : null;
      if (dateInput) dateInput.disabled = event.target.checked;
    } else {
      contract.fields[key] = event.target.value;
    }
    if (key === "price") {
      contract.fields.amountUpper = moneyToChinese(event.target.value);
      const amountUpperInput = document.querySelector('[data-field-key="amountUpper"]');
      if (amountUpperInput) amountUpperInput.value = contract.fields.amountUpper;
    }
    if (key === "promotionServiceFee") {
      contract.fields.promotionServiceFeeUpper = moneyToChinese(event.target.value);
      const promotionUpperInput = document.querySelector('[data-field-key="promotionServiceFeeUpper"]');
      if (promotionUpperInput) promotionUpperInput.value = contract.fields.promotionServiceFeeUpper;
    }
    contract.updatedAt = nowIso();
    saveStore(true);
    renderContractList();
    renderMonthlyStats();
    if (event.target.type === "date" || event.target.dataset.retentionLongTerm === "true") {
      pendingAdminPreviewRefresh = true;
      adminDatePickerFieldKey = "";
      adminEditingSessionUntil = Math.max(adminEditingSessionUntil, Date.now() + 900);
      scheduleAdminEditingSessionRelease(900);
    }
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
    const file = event.target.files && event.target.files[0];
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
        renderForm({ force: true, ignoreDefer: true });
      })
      .catch(() => {
        showValidation(["甲方签名图片读取失败，请重新上传。"]);
      });
  }

  function createContract() {
    clearAdminEditingSession({ force: true, clearPending: true });
    activeInlineClauseToken = "";
    pendingInlineClauseFocusToken = "";
    const contract = makeContract();
    store.contracts.unshift(contract);
    store.selectedId = contract.id;
    activeView = "editor";
    isMobileContractLibraryOpen = false;
    document.getElementById("searchInput").value = "";
    saveStore(true, { reason: "create-contract", immediate: true });
    renderAll();
    scrollAdminEditorIntoViewOnMobile();
  }

  function saveCurrentDraft() {
    const contract = currentContract();
    if (!contract) return;
    contract.updatedAt = nowIso();
    saveStore(true, { reason: "save-draft" });
    showValidation([]);
    renderForm({ force: true, ignoreDefer: true });
    renderPreview();
  }

  async function publishContract() {
    const contract = currentContract();
    const status = contract ? String(contract.status || "").trim().toLowerCase() : "";
    if (!contract || status !== "draft") {
      showValidation(["当前合同状态不可发布，请选择草稿合同后重试。"]);
      return;
    }
    const errors = validateContract(contract);
    if (errors.length) {
      showValidation(errors);
      return;
    }
    clearAdminEditingSession({ force: true, clearPending: true });
    activeInlineClauseToken = "";
    pendingInlineClauseFocusToken = "";
    contract.status = "published";
    contract.publishedAt = nowIso();
    contract.updatedAt = contract.publishedAt;
    contract.token = contract.token || randomToken(18);
    contract.signWriteToken = contract.signWriteToken || randomToken(24);
    contract.snapshot = {
      fields: clone(contract.fields),
      clauses: clone(composeEditableContractClauses(contract)),
      clauseVersion: activeClauseVersion().version,
      clauseSeedVersion: activeClauseVersion().seedVersion || "",
      publishedAt: contract.publishedAt,
    };
    contract.audit.push(makeAudit("发布合同", "生成乙方签署链接并锁定合同快照"));
    saveStore(true, { reason: "publish-contract", skipRemote: true });
    showValidation([]);
    renderAll();
    if (isAdminCloudReady()) {
      const synced = await flushRemoteStore("publish-contract");
      if (!synced) {
        showValidation(["Cloud sync failed after publish. Please retry before sending the signer link."]);
        renderAll();
        return;
      }
      try {
        await ensureValidShareLink(contract, { forceValidate: true });
      } catch (error) {
        showValidation([friendlyCloudError(error, "签署链接校验失败，请稍后重试。")]);
      }
    }
    renderAll();
  }

  function revokeContract() {
    const contract = currentContract();
    if (!contract || !["published", "confirmed"].includes(contract.status)) return;
    clearAdminEditingSession({ force: true, clearPending: true });
    activeInlineClauseToken = "";
    pendingInlineClauseFocusToken = "";
    contract.status = "revoked";
    contract.updatedAt = nowIso();
    contract.audit.push(makeAudit("撤回合同", "乙方签署链接失效"));
    saveStore(true, { reason: "revoke-contract", immediate: true });
    renderAll();
  }

  function confirmSigner() {
    const contract = signerContract();
    const checked = document.getElementById("confirmCheckbox").checked;
    if (!contract || !checked || contract.status !== "published") return;
    contract.status = "confirmed";
    contract.confirmedAt = nowIso();
    contract.updatedAt = contract.confirmedAt;
    contract.audit.push(makeAudit("乙方确认", "乙方勾选已确认合同内容无误"));
    if (signerWorkspaceId && signerToken) {
      renderAll();
      return;
    }
    saveStore(true, { reason: "confirm-signer", immediate: true });
    renderAll();
  }

  async function submitSignature() {
    if (signerSubmitInProgress) return;
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
    if (signerWorkspaceId && signerToken) {
      try {
        signerSubmitInProgress = true;
        signerRemoteLoading = true;
        startSignerSubmitSlowNotice();
        showSignMessage("正在安全提交签署，请勿关闭页面...", "ok");
        renderTopState();
        renderSigner();
        const remoteContract = await submitRemoteSignatureWithFallback({
          signerName,
          imageData: signatureImage,
          userAgent: navigator.userAgent,
        });
        signerPayloadContract = normalizeContract(remoteContract);
        signerPayloadContract.signature = clone(remoteContract.signature || signerPayloadContract.signature);
        mergeRemoteContractIntoLocalStore(signerPayloadContract);
        storeSignerContractSessionCache(currentSignerRequestKey(), signerPayloadContract);
        signerRemoteLoading = false;
        signerSubmitInProgress = false;
        clearSignerSubmitSlowNotice();
        showSignMessage(`签署完成，已同步给甲方。签署人：${signerName}，时间：${formatDateTime(signature.signedAt)}`, "ok");
        confirmSignerCloudSyncInBackground();
        renderAll();
      } catch (error) {
        signerRemoteLoading = false;
        signerSubmitInProgress = false;
        clearSignerSubmitSlowNotice();
        showSignMessage(friendlyCloudError(error, "线上签署提交失败，请稍后重试。"));
        renderAll();
      }
      return;
    }
    contract.status = "signed";
    contract.signedAt = signature.signedAt;
    contract.updatedAt = signature.signedAt;
    contract.signature = signature;
    syncSignedSignature(contract);
    contract.audit.push(makeAudit("乙方签署", `${signerName} 完成电子手写签名`));
    saveStore(true, { reason: "submit-signature", immediate: true });
    showSignMessage("签署已完成，合同预览和导出 PDF 会显示乙方签名。", "ok");
    renderAll();
  }

  function selectContractFromList(event) {
    const deleteButton = getClosest(event.target, "[data-delete-contract-id]");
    if (deleteButton) {
      deleteContract(deleteButton.dataset.deleteContractId);
      return;
    }
    const item = getClosest(event.target, "[data-contract-id]");
    if (!item) return;
    clearAdminEditingSession({ force: true, clearPending: true });
    activeInlineClauseToken = "";
    pendingInlineClauseFocusToken = "";
    store.selectedId = item.dataset.contractId;
    activeView = "editor";
    isMobileContractLibraryOpen = false;
    signerToken = "";
    signerWorkspaceId = "";
    signerWriteToken = "";
    signerPayloadContract = null;
    signerLinkWarning = "";
    signerRemoteLoading = false;
    if (isSignerRoute()) {
      history.replaceState(null, "", location.pathname);
    }
    saveStore(false, { skipRemote: true });
    renderAll();
    scrollAdminEditorIntoViewOnMobile();
  }

  function deleteContract(contractId) {
    const contract = store.contracts.find((item) => item.id === contractId);
    if (!contract) return;
    const ok = window.confirm(`确定删除合同「${contract.fields.brand || contract.fields.creatorName || "未命名合同"}」？`);
    if (!ok) return;
    clearAdminEditingSession({ force: true, clearPending: true });
    activeInlineClauseToken = "";
    pendingInlineClauseFocusToken = "";
    store.deletedContracts = normalizeDeletedContracts([
      ...(Array.isArray(store.deletedContracts) ? store.deletedContracts : []),
      {
        id: contract.id,
        token: contract.token,
        deletedAt: nowIso(),
      },
    ]);
    store.contracts = store.contracts.filter((item) => item.id !== contractId);
    if (!store.contracts.length) {
      const next = makeContract();
      store.contracts = [next];
      store.selectedId = next.id;
    } else if (store.selectedId === contractId) {
      store.selectedId = store.contracts[0].id;
    }
    saveStore(true, { reason: "delete-contract", immediate: true });
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
    const contract = currentContract();
    if (!contract) return;
    const input = document.getElementById("shareLink");
    let value = input.value;
    if (hasAdminCloudConfig() && ["published", "confirmed", "signed"].includes(contract.status)) {
      try {
        value = await ensureValidShareLink(contract, { forceValidate: true });
        renderShareLink(findContractByIdentity(contract) || contract);
      } catch (error) {
        showValidation([friendlyCloudError(error, "签署链接校验失败，请稍后重试。")]);
        return;
      }
    }
    if (!value) return;
    const copied = await copyTextToClipboard(value, input);
    document.getElementById("syncState").textContent = copied ? "签署链接已复制" : "请长按链接手动复制";
  }

  async function copyTextToClipboard(text, sourceInput) {
    if (!text) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
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
    const currentImage = signerUploadData
      || getIn(contract, ["signature", "imageData"])
      || getIn(contract, ["snapshot", "signature", "imageData"])
      || "";
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
    const file = event.target.files && event.target.files[0];
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
    readImageFileAsDataUrl(file, {
      maxWidth: SIGNATURE_IMAGE_WIDTH,
      maxHeight: 220,
      type: "image/jpeg",
      quality: SIGNATURE_IMAGE_QUALITY,
      fillStyle: "#fff",
    })
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
        if (!field.required || !isFieldRequiredForContract(field.key, contract.fields)) return;
        if (!String(contract.fields[field.key] || "").trim()) {
          errors.push(`${field.label}不能为空`);
        }
      });
    });
    if (Number(contract.fields.price) <= 0) errors.push("价格必须大于 0");
    if (Number(promotionServiceFeeValue(contract.fields)) <= 0) errors.push("一次性推广服务费必须大于 0");
    return errors;
  }

  function isFieldRequiredForContract(fieldKey, fields = {}) {
    const paymentMode = normalizePaymentMode(fields.paymentMode);
    if (paymentMode === "one_time") {
      return ![
        "prepaymentWorkdays",
        "prepaymentPercent",
        "finalPaymentAfterPublishDays",
        "finalPaymentWorkdays",
        "finalPaymentPercent",
        "performanceMetric",
      ].includes(fieldKey);
    }
    if (paymentMode === "installment") {
      return fieldKey !== "oneTimePaymentWorkdays";
    }
    return true;
  }

  function setupSignatureCanvas() {
    const canvas = document.getElementById("signatureCanvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    let drawing = false;

    function paintBackground(rect) {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, rect.width, rect.height);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        setTimeout(resize, 100);
        return;
      }
      const ratio = window.devicePixelRatio || 1;
      const previous = signatureDirty ? canvas.toDataURL("image/png") : "";
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 2.2;
      context.strokeStyle = "#111";
      paintBackground(rect);
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
      event.preventDefault();
      if (!canvasReady) resize();
      drawing = true;
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        // Some Android WebViews do not support pointer capture reliably.
      }
      const p = point(event);
      context.beginPath();
      context.moveTo(p.x, p.y);
      signatureDirty = true;
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!drawing) return;
      event.preventDefault();
      const p = point(event);
      context.lineTo(p.x, p.y);
      context.stroke();
    });

    canvas.addEventListener("pointerup", (event) => {
      event.preventDefault();
      drawing = false;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture may already be released.
      }
    });

    canvas.addEventListener("pointercancel", () => {
      drawing = false;
    });

    canvas.addEventListener("lostpointercapture", () => {
      drawing = false;
    });

    canvas.addEventListener("pointerleave", () => {
      drawing = false;
    });

    if (!window.PointerEvent) {
      canvas.addEventListener("touchstart", (event) => {
        const contract = signerContract();
        if (!contract || !["published", "confirmed"].includes(contract.status)) return;
        const touch = event.touches[0];
        if (!touch) return;
        event.preventDefault();
        if (!canvasReady) resize();
        drawing = true;
        const p = point(touch);
        context.beginPath();
        context.moveTo(p.x, p.y);
        signatureDirty = true;
      }, { passive: false });

      canvas.addEventListener("touchmove", (event) => {
        if (!drawing) return;
        const touch = event.touches[0];
        if (!touch) return;
        event.preventDefault();
        const p = point(touch);
        context.lineTo(p.x, p.y);
        context.stroke();
      }, { passive: false });

      canvas.addEventListener("touchend", (event) => {
        event.preventDefault();
        drawing = false;
      }, { passive: false });

      canvas.addEventListener("touchcancel", () => {
        drawing = false;
      }, { passive: false });
    }

    window.addEventListener("resize", resize);
    resizeSignatureCanvas = resize;
    setTimeout(resize, 0);
    window.addEventListener("orientationchange", () => setTimeout(resize, 100));
  }

  function setupPartyASignatureCanvas() {
    const canvas = document.getElementById("partyASignatureCanvas");
    if (!canvas) {
      partyASignatureCanvasContractId = "";
      return;
    }
    const context = canvas.getContext("2d");
    let drawing = false;

    function editableContract() {
      return currentDraftContract();
    }

    const initialContract = editableContract();
    partyASignatureCanvasContractId = partyASignatureDraftKey(initialContract);

    function persistDraftSignature() {
      const contract = editableContract();
      if (!contract || !canvas.width || !canvas.height) return;
      setPartyASignatureDraft(contract, compactPartyASignatureDataUrl(canvas));
    }

    function finishStroke(event) {
      drawing = false;
      partyASignatureDrawingContractId = "";
      persistDraftSignature();
      lockAdminPreview(1400);
      scheduleAdminPreviewRefresh(260);
      if (!event) return;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture may already be released.
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const contract = editableContract();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 2.2;
      context.strokeStyle = "#111";
      const partyASignature = getPartyASignatureDraft(contract)
        || getIn(contract, ["fields", "partyASignature"])
        || getIn(contract, ["snapshot", "fields", "partyASignature"]);
      if (contract && partyASignature) {
        const image = new Image();
        image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
        image.src = partyASignature;
      }
    }

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    canvas.addEventListener("pointerdown", (event) => {
      const contract = editableContract();
      if (!contract) return;
      drawing = true;
      partyASignatureDrawingContractId = partyASignatureDraftKey(contract);
      lockAdminPreview(1800);
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture may not be available in all environments.
      }
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
      finishStroke(event);
    });

    canvas.addEventListener("pointercancel", (event) => {
      finishStroke(event);
    });

    canvas.addEventListener("lostpointercapture", () => {
      finishStroke();
    });

    canvas.addEventListener("pointerleave", () => {
      finishStroke();
    });

    const clearPartyButton = document.getElementById("clearPartyASignBtn");
    if (clearPartyButton) clearPartyButton.addEventListener("click", () => {
      const contract = editableContract();
      if (!contract) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      clearPartyASignatureDraft(contract);
      contract.fields.partyASignature = "";
      contract.updatedAt = nowIso();
      saveStore(true, { reason: "clear-party-a-signature", immediate: true });
      clearAdminEditingSession({ force: true, clearPending: true });
      renderForm({ force: true, ignoreDefer: true });
      renderPreview();
    });

    const savePartyButton = document.getElementById("savePartyASignBtn");
    if (savePartyButton) savePartyButton.addEventListener("click", () => {
      const contract = editableContract();
      if (!contract) return;
      contract.fields.partyASignature = compactPartyASignatureDataUrl(canvas);
      clearPartyASignatureDraft(contract);
      contract.updatedAt = nowIso();
      saveStore(true, { reason: "save-party-a-signature", immediate: true });
      clearAdminEditingSession({ force: true, clearPending: true });
      renderForm({ force: true, ignoreDefer: true });
      renderPreview();
    });

    setTimeout(resize, 0);
  }

  function clearSignatureCanvas(showMessage) {
    const canvas = document.getElementById("signatureCanvas");
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    context.fillStyle = "#fff";
    context.fillRect(0, 0, rect.width || canvas.width, rect.height || canvas.height);
    signatureDirty = false;
    if (showMessage) showSignMessage("签名已清除。");
  }

  function compactSignatureDataUrl(sourceCanvas) {
    const target = document.createElement("canvas");
    const sourceRatio = sourceCanvas.width && sourceCanvas.height ? sourceCanvas.width / sourceCanvas.height : 3;
    target.width = SIGNATURE_IMAGE_WIDTH;
    target.height = Math.max(180, Math.round(target.width / sourceRatio));
    const context = target.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, target.width, target.height);
    context.drawImage(sourceCanvas, 0, 0, target.width, target.height);
    return target.toDataURL("image/jpeg", SIGNATURE_IMAGE_QUALITY);
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
        return normalizeStoreState(JSON.parse(raw));
      } catch (error) {
        console.warn("Failed to load store", error);
      }
    }
    return defaultStoreState();
  }

  function defaultStoreState() {
    const contract = makeContract();
    const clauseVersions = seedClauseVersions();
    return {
      selectedId: contract.id,
      contracts: [contract],
      deletedContracts: [],
      brandOptions: normalizeOptions([], DEFAULT_BRAND_OPTIONS),
      platformOptions: normalizeOptions([], DEFAULT_PLATFORM_OPTIONS),
      brandOptionsUpdatedAt: nowIso(),
      platformOptionsUpdatedAt: nowIso(),
      clauseVersions,
      activeClauseVersionId: clauseVersions[0].id,
      lastAppliedClauseSeed: CLAUSE_SEED_VERSION,
    };
  }

  function normalizeStoreState(parsed) {
    if (!parsed || !Array.isArray(parsed.contracts) || !parsed.contracts.length) return defaultStoreState();
    const next = {
      selectedId: parsed.selectedId || "",
      contracts: parsed.contracts.map(normalizeContract),
      deletedContracts: normalizeDeletedContracts(parsed.deletedContracts),
      brandOptions: normalizeOptions(
        parsed.brandOptions,
        DEFAULT_BRAND_OPTIONS,
      ),
      platformOptions: normalizeOptions(
        parsed.platformOptions,
        DEFAULT_PLATFORM_OPTIONS,
      ),
      brandOptionsUpdatedAt: normalizeOptionSetUpdatedAt(
        parsed.brandOptionsUpdatedAt,
        parsed.updatedAt,
        parsed.contracts,
      ),
      platformOptionsUpdatedAt: normalizeOptionSetUpdatedAt(
        parsed.platformOptionsUpdatedAt,
        parsed.updatedAt,
        parsed.contracts,
      ),
      clauseVersions: normalizeClauseVersions(parsed.clauseVersions),
      activeClauseVersionId: parsed.activeClauseVersionId || "",
      lastAppliedClauseSeed: parsed.lastAppliedClauseSeed || "",
    };
    const seededVersion = next.clauseVersions.find((version) => version.seedVersion === CLAUSE_SEED_VERSION);
    if (seededVersion && next.lastAppliedClauseSeed !== CLAUSE_SEED_VERSION) {
      next.activeClauseVersionId = seededVersion.id;
      next.lastAppliedClauseSeed = CLAUSE_SEED_VERSION;
    } else {
      next.activeClauseVersionId = next.clauseVersions.some((version) => version.id === next.activeClauseVersionId)
        ? next.activeClauseVersionId
        : next.clauseVersions[next.clauseVersions.length - 1].id;
    }
    if (!next.contracts.some((contract) => contract.id === next.selectedId)) {
      next.selectedId = next.contracts[0].id;
    }
    if (!next.lastAppliedClauseSeed) next.lastAppliedClauseSeed = CLAUSE_SEED_VERSION;
    return next;
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
    fields.paymentMode = normalizePaymentMode(rawFields.paymentMode || fields.paymentMode);
    fields.amountUpper = moneyToChinese(fields.price) || fields.amountUpper || DEFAULT_FIELDS.amountUpper;
    if (!Object.prototype.hasOwnProperty.call(rawFields, "promotionServiceFee")) {
      fields.promotionServiceFee = fields.price || DEFAULT_FIELDS.price;
    }
    fields.promotionServiceFeeUpper = moneyToChinese(fields.promotionServiceFee)
      || fields.promotionServiceFeeUpper
      || DEFAULT_FIELDS.promotionServiceFeeUpper;
    fields.oneTimePaymentWorkdays = String(fields.oneTimePaymentWorkdays || DEFAULT_FIELDS.oneTimePaymentWorkdays).trim() || DEFAULT_FIELDS.oneTimePaymentWorkdays;
    const snapshot = normalizeSnapshot(contract.snapshot, fields, contract.status);
    const status = String(contract.status || "draft").trim().toLowerCase();
    return {
      ...contract,
      status: STATUS[status] ? status : "draft",
      token: contract.token || randomToken(18),
      signWriteToken: contract.signWriteToken || randomToken(24),
      audit: Array.isArray(contract.audit) ? contract.audit : [],
      fields,
      snapshot,
      signature: contract.signature || getIn(snapshot, ["signature"]) || null,
    };
  }

  function normalizeDeletedContracts(items) {
    const map = new Map();
    (Array.isArray(items) ? items : []).forEach((item) => {
      const normalized = normalizeDeletedContract(item);
      if (!normalized) return;
      const key = deletedContractKey(normalized);
      const existing = map.get(key);
      if (!existing || deletedContractTimestamp(normalized) >= deletedContractTimestamp(existing)) {
        map.set(key, normalized);
      }
    });
    return Array.from(map.values());
  }

  function normalizeDeletedContract(item) {
    if (!item || typeof item !== "object") return null;
    const id = String(item.id || "").trim();
    const token = String(item.token || "").trim();
    if (!id && !token) return null;
    return {
      id,
      token,
      deletedAt: String(item.deletedAt || item.updatedAt || nowIso()),
    };
  }

  function normalizeSnapshot(snapshot, fields, contractStatus = "draft") {
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
        paymentMode: normalizePaymentMode(rawSnapshotFields.paymentMode || fields.paymentMode),
        oneTimePaymentWorkdays: rawSnapshotFields.oneTimePaymentWorkdays || fields.oneTimePaymentWorkdays,
        partyASignDate: rawSnapshotFields.partyASignDate || fields.partyASignDate,
        partyASignature: rawSnapshotFields.partyASignature || fields.partyASignature,
      },
      clauses: Array.isArray(snapshot.clauses) && snapshot.clauses.length ? snapshot.clauses : clone(DEFAULT_CLAUSES),
      clauseVersion: snapshot.clauseVersion || CLAUSE_SEED_LABEL,
      clauseSeedVersion: snapshot.clauseSeedVersion || "",
    };
    normalizePlatformFields(normalized.fields, rawSnapshotFields);
    normalized.fields.amountUpper = moneyToChinese(normalized.fields.price) || normalized.fields.amountUpper || fields.amountUpper;
    if (!Object.prototype.hasOwnProperty.call(rawSnapshotFields, "promotionServiceFee")) {
      normalized.fields.promotionServiceFee = normalized.fields.price || fields.price || DEFAULT_FIELDS.price;
    }
    normalized.fields.promotionServiceFeeUpper = moneyToChinese(normalized.fields.promotionServiceFee)
      || normalized.fields.promotionServiceFeeUpper
      || fields.promotionServiceFeeUpper
      || DEFAULT_FIELDS.promotionServiceFeeUpper;
    if (contractStatus === "draft" && shouldUpgradeSnapshotClauses(normalized)) {
      normalized.clauses = clone(DEFAULT_CLAUSES);
      normalized.clauseVersion = CLAUSE_SEED_LABEL;
      normalized.clauseSeedVersion = CLAUSE_SEED_VERSION;
    }
    return normalized;
  }

  function shouldUpgradeSnapshotClauses(snapshot) {
    if (!snapshot) return false;
    if (snapshot.clauseSeedVersion === CLAUSE_SEED_VERSION) return false;
    return false;
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

  function normalizeOptionSetUpdatedAt(primaryValue, fallbackValue, contracts = []) {
    const direct = latestTimestamp([primaryValue, fallbackValue]);
    if (direct > 0) return new Date(direct).toISOString();
    const contractTime = latestTimestamp((Array.isArray(contracts) ? contracts : []).map((contract) => contract && contract.updatedAt));
    return contractTime > 0 ? new Date(contractTime).toISOString() : nowIso();
  }

  function optionStoreUpdatedAtKey(optionStoreKey) {
    if (optionStoreKey === "brandOptions") return "brandOptionsUpdatedAt";
    if (optionStoreKey === "platformOptions") return "platformOptionsUpdatedAt";
    return "";
  }

  function touchOptionStore(optionStoreKey, at = nowIso()) {
    const updatedAtKey = optionStoreUpdatedAtKey(optionStoreKey);
    if (!updatedAtKey) return;
    store[updatedAtKey] = at;
  }

  function mergeManagedOptions(remote, local, optionStoreKey, defaults = []) {
    const updatedAtKey = optionStoreUpdatedAtKey(optionStoreKey);
    const remoteTime = latestTimestamp([remote && remote[updatedAtKey], remote && remote.updatedAt]);
    const localTime = latestTimestamp([local && local[updatedAtKey], local && local.updatedAt]);
    const sourceValues = remoteTime > localTime
      ? remote[optionStoreKey]
      : localTime > remoteTime
        ? local[optionStoreKey]
        : Array.isArray(local[optionStoreKey]) && local[optionStoreKey].length
          ? local[optionStoreKey]
          : remote[optionStoreKey];
    return {
      values: normalizeOptions(sourceValues, defaults),
      updatedAt: normalizeOptionSetUpdatedAt(
        remoteTime > localTime ? remote && remote[updatedAtKey] : localTime > remoteTime ? local && local[updatedAtKey] : local && local[updatedAtKey] || remote && remote[updatedAtKey],
        remoteTime > localTime ? remote && remote.updatedAt : localTime > remoteTime ? local && local.updatedAt : local && local.updatedAt || remote && remote.updatedAt,
      ),
    };
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
    const platform = String(fields && fields.platform || "").trim();
    const account = String(fields && fields.platformAccount || "").trim();
    if (platform && account) return `${platform} / ${account}`;
    return platform || account || "-";
  }

  function formatContractWatermark(brand) {
    const text = String(brand || "").trim();
    const letters = (text.match(/[A-Za-z]+/g) || []).join("").toUpperCase();
    if (letters) return letters;
    if (text) return text;
    return "BRAND";
  }

  function buildContractWatermarkSvg(text) {
    const value = escapeSvgText(String(text || "BRAND").trim() || "BRAND");
    const charCount = Array.from(value).length || 1;
    const fontSize = charCount <= 5 ? 238 : charCount <= 8 ? 214 : charCount <= 12 ? 186 : 164;
    const textLength = charCount <= 4 ? 600 : charCount <= 8 ? 730 : charCount <= 12 ? 820 : 900;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" preserveAspectRatio="xMidYMid meet">
        <rect width="100%" height="100%" fill="none"/>
        <g transform="translate(600 800) rotate(-30)">
          <text
            x="0"
            y="0"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="SimSun, serif"
            font-size="${fontSize}"
            font-weight="700"
            letter-spacing="8"
            fill="rgb(80,80,80)"
            fill-opacity="0.2"
            textLength="${textLength}"
            lengthAdjust="spacingAndGlyphs"
          >${value}</text>
        </g>
      </svg>
    `.trim().replace(/\s*\n\s*/g, " ");
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function currentDraftContract() {
    const contract = currentContract();
    return contract && contract.status === "draft" ? contract : null;
  }

  function partyASignatureDraftKey(contract) {
    return contract && contract.id ? String(contract.id) : "";
  }

  function getPartyASignatureDraft(contract) {
    const key = partyASignatureDraftKey(contract);
    return key ? partyASignatureDraftByContractId.get(key) || "" : "";
  }

  function setPartyASignatureDraft(contract, dataUrl) {
    const key = partyASignatureDraftKey(contract);
    if (!key) return;
    if (dataUrl) {
      partyASignatureDraftByContractId.set(key, dataUrl);
    } else {
      partyASignatureDraftByContractId.delete(key);
    }
  }

  function clearPartyASignatureDraft(contract) {
    setPartyASignatureDraft(contract, "");
  }

  function shouldDeferPartyASignaturePreview(contract) {
    return Boolean(
      contract
      && contract.status === "draft"
      && (
        (partyASignatureDrawingContractId
          && partyASignatureDrawingContractId === partyASignatureDraftKey(contract))
        || hasUnsavedPartyASignatureDraft(contract)
        || hasActiveAdminEditingSession(contract)
        || hasActiveAdminDatePickerSession(contract)
        || Date.now() < adminPreviewFreezeUntil
      ),
    );
  }

  function capturePartyASignatureDraftFromDom() {
    const draftContractId = partyASignatureCanvasContractId;
    if (!draftContractId) return;
    const contract = store.contracts.find((item) => String(item.id || "") === draftContractId && item.status === "draft");
    if (!contract) return;
    const canvas = document.getElementById("partyASignatureCanvas");
    if (!canvas || !canvas.width || !canvas.height) return;
    setPartyASignatureDraft(contract, compactPartyASignatureDataUrl(canvas));
  }

  function buildClauseEditorIdentity(version, draft) {
    return JSON.stringify({
      id: version ? version.id || "" : "",
      updatedAt: version ? version.updatedAt || "" : "",
      versionName: draft ? draft.versionName || "" : "",
      sections: draft ? draft.sections || [] : [],
    });
  }

  function isClauseEditorInteractionActive() {
    const activeElement = document.activeElement;
    if (!activeElement || !getClosest(activeElement, "#clausesView")) return false;
    return ["INPUT", "TEXTAREA"].includes(activeElement.tagName);
  }

  function clauseEditorFreezeDuration(target) {
    if (!target || !getClosest(target, "#clausesView")) return 0;
    const clauseField = String(target.dataset.clauseField || "").trim();
    if (clauseField === "body") return 7600;
    if (clauseField === "title") return 5600;
    if (target.id === "clauseVersionName") return 5600;
    if (target.tagName === "TEXTAREA") return 7200;
    if (target.tagName === "INPUT") return 5200;
    return 3200;
  }

  function resolveClauseEditingFieldKey(target) {
    if (!target) return "";
    return String(
      target.dataset.clauseField
      || target.dataset.clauseTemplateId
      || target.id
      || target.name
      || target.type
      || "clauses"
    ).trim();
  }

  function beginClauseEditingSession(target, durationMs = 2200) {
    const version = activeClauseVersion();
    if (!version || !target || !getClosest(target, "#clausesView")) return;
    clauseEditingVersionId = version.id;
    clauseEditingFieldKey = resolveClauseEditingFieldKey(target);
    clauseEditingSessionUntil = Math.max(
      clauseEditingSessionUntil,
      Date.now() + Math.max(clauseEditorFreezeDuration(target), durationMs, 1800),
    );
    if (clauseEditingReleaseTimer) {
      clearTimeout(clauseEditingReleaseTimer);
      clauseEditingReleaseTimer = 0;
    }
  }

  function clearClauseEditingSession(options = {}) {
    if (!options.keepTimers && clauseEditingReleaseTimer) {
      clearTimeout(clauseEditingReleaseTimer);
      clauseEditingReleaseTimer = 0;
    }
    clauseEditingVersionId = "";
    clauseEditingFieldKey = "";
    clauseEditingSessionUntil = 0;
    if (options.clearPending) pendingClauseViewRefresh = false;
  }

  function scheduleClauseEditingSessionRelease(delayMs = 320) {
    if (clauseEditingReleaseTimer) clearTimeout(clauseEditingReleaseTimer);
    clauseEditingReleaseTimer = window.setTimeout(() => {
      clauseEditingReleaseTimer = 0;
      releaseClauseEditingSessionIfIdle();
    }, Math.max(160, delayMs));
  }

  function releaseClauseEditingSessionIfIdle() {
    const version = activeClauseVersion();
    if (!version) {
      clearClauseEditingSession({ force: true, clearPending: true });
      return;
    }
    if (isClauseEditorInteractionActive()) return;
    const now = Date.now();
    if (now < clauseEditingSessionUntil) {
      scheduleClauseEditingSessionRelease(clauseEditingSessionUntil - now + 140);
      return;
    }
    const shouldRefresh = pendingClauseViewRefresh;
    clearClauseEditingSession();
    if (shouldRefresh) {
      renderClauses({ force: true, ignoreDefer: true });
    }
  }

  function hasActiveClauseEditingSession(version) {
    return Boolean(
      version
      && clauseEditingVersionId === version.id
      && (Date.now() < clauseEditingSessionUntil || isClauseEditorInteractionActive())
    );
  }

  function shouldDeferClauseViewRefresh(version) {
    return Boolean(version && hasActiveClauseEditingSession(version));
  }

  function handleClauseEditorPointerDown(event) {
    const duration = clauseEditorFreezeDuration(event.target);
    if (!duration) return;
    beginClauseEditingSession(event.target, duration);
  }

  function handleClauseEditorFocusIn(event) {
    const duration = clauseEditorFreezeDuration(event.target);
    if (!duration) return;
    beginClauseEditingSession(event.target, duration);
  }

  function handleClauseEditorFocusOut(event) {
    const nextTarget = event.relatedTarget;
    if (nextTarget && getClosest(nextTarget, "#clausesView")) return;
    pendingClauseViewRefresh = true;
    captureClauseEditorDraftFromDom();
    const releaseDelay = clauseEditorFreezeDuration(event.target) || 2200;
    clauseEditingSessionUntil = Math.max(clauseEditingSessionUntil, Date.now() + Math.max(1400, releaseDelay));
    scheduleClauseEditingSessionRelease(releaseDelay + 180);
  }

  function handleClauseEditorKeydown(event) {
    const duration = clauseEditorFreezeDuration(event.target);
    if (!duration) return;
    beginClauseEditingSession(event.target, Math.max(duration, 6000));
  }

  function saveStore(announce, options = {}) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    if (announce && channel) channel.postMessage({ from: INSTANCE_ID, at: nowIso() });
    if (!options.skipRemote) {
      scheduleRemoteStoreSync(options.reason || "store-change", options.immediate === true);
    }
  }

  function makeContract(fields = {}) {
    const now = nowIso();
    return {
      id: randomToken(12),
      status: "draft",
      token: randomToken(18),
      signWriteToken: randomToken(24),
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
    if (!getIn(contract, ["signature", "imageData"])) return;
    const snapshotFields = getIn(contract, ["snapshot", "fields"]) || {};
    const snapshotClauses = getIn(contract, ["snapshot", "clauses"]);
    contract.snapshot = {
      ...(contract.snapshot || {}),
      fields: {
        ...clone(contract.fields),
        ...snapshotFields,
        partyASignDate: snapshotFields.partyASignDate || contract.fields.partyASignDate || "",
        partyASignature: snapshotFields.partyASignature || contract.fields.partyASignature || "",
      },
      clauses: clone(snapshotClauses || activeClauseVersion().sections),
      clauseVersion: getIn(contract, ["snapshot", "clauseVersion"]) || activeClauseVersion().version,
      clauseSeedVersion: getIn(contract, ["snapshot", "clauseSeedVersion"]) || activeClauseVersion().seedVersion || "",
      publishedAt: contract.publishedAt || getIn(contract, ["snapshot", "publishedAt"]) || nowIso(),
      signature: clone(contract.signature),
      signedAt: contract.signedAt || contract.signature.signedAt || nowIso(),
    };
  }

  function currentContract() {
    return store.contracts.find((contract) => contract.id === store.selectedId) || store.contracts[0] || null;
  }

  function findContractByIdentity(contractLike) {
    if (!contractLike) return null;
    const matchId = String(contractLike.id || "").trim();
    const matchToken = String(contractLike.token || "").trim();
    return store.contracts.find((contract) => (
      (matchId && String(contract.id || "").trim() === matchId)
      || (matchToken && String(contract.token || "").trim() === matchToken)
    )) || null;
  }

  function signerContract() {
    if (signerToken) {
      if (signerWorkspaceId) {
        return signerPayloadContract
          || store.contracts.find((contract) => contract.token === signerToken)
          || null;
      }
      const localContract = store.contracts.find((contract) => contract.token === signerToken) || null;
      if (localContract) {
        hydrateLocalSignerContract(localContract, signerPayloadContract);
        return localContract;
      }
      return signerPayloadContract || null;
    }
    return currentContract();
  }

  function mergeRemoteContractIntoLocalStore(remoteContract) {
    if (!remoteContract) return false;
    const normalized = normalizeContract(remoteContract);
    const target = store.contracts.find((contract) => (
      (remoteContract.id && contract.id === remoteContract.id)
      || (remoteContract.token && contract.token === remoteContract.token)
    ));
    if (!target) {
      store.contracts.unshift(clone(normalized));
      store.selectedId = store.selectedId || normalized.id;
      saveStore(false, { skipRemote: true });
      return true;
    }
    const before = JSON.stringify(target);
    Object.assign(target, clone(normalized));
    if (before === JSON.stringify(target)) return false;
    saveStore(false, { skipRemote: true });
    return true;
  }

  function renderFields(contract) {
    if (contract.snapshot && contract.status !== "draft") return contract.snapshot.fields;
    return contract.fields;
  }

  function renderClausesForContract(contract) {
    if (contract.snapshot && contract.status !== "draft") return contract.snapshot.clauses;
    return composeEditableContractClauses(contract);
  }

  function composeEditableContractClauses(contract) {
    const fields = renderFields(contract) || getIn(contract, ["fields"]) || {};
    const version = activeClauseVersion();
    const baseSections = version && Array.isArray(version.sections) ? version.sections : DEFAULT_CLAUSES;
    const dynamicSections = clone(DEFAULT_CLAUSES.slice(0, 2)).map((clause) => ({
      ...clause,
      body: resolveDynamicClauseBody(clause, fields),
    }));
    return [
      ...dynamicSections,
      ...normalizeTailClauseSections(baseSections, DEFAULT_CLAUSES.slice(2)),
    ].map((clause) => ({
      title: resolveClauseTemplateText(clause.title, fields),
      body: (Array.isArray(clause.body) ? clause.body : []).map((line) => resolveClauseTemplateText(line, fields)),
    }));
  }

  function normalizeTailClauseSections(sections, fallbackSections = []) {
    const incoming = Array.isArray(sections) ? sections : [];
    const filtered = incoming.filter((clause) => !isDynamicClauseTitle(clause && clause.title));
    const source = filtered.length ? filtered : fallbackSections;
    return source.map((clause, index) => ({
      title: getIn(fallbackSections, [index, "title"]) || clause.title || buildDefaultTailClauseTitle(index),
      body: Array.isArray(clause.body) && clause.body.length
        ? clone(clause.body)
        : clone(getIn(fallbackSections, [index, "body"]) || makeDefaultTailClauseSection(index).body),
    }));
  }

  function makeDefaultTailClauseSection(index) {
    return {
      title: buildDefaultTailClauseTitle(index),
      body: ["请填写条款内容。"],
    };
  }

  function buildDefaultTailClauseTitle(index) {
    const clauseNumber = index + 5;
    return `${toChineseClauseNumeral(clauseNumber)}、补充条款`;
  }

  function toChineseClauseNumeral(value) {
    const numerals = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return "条款";
    if (number < 10) return numerals[number];
    if (number === 10) return "十";
    if (number < 20) return `十${numerals[number % 10]}`;
    if (number % 10 === 0) return `${numerals[Math.floor(number / 10)]}十`;
    if (number < 100) return `${numerals[Math.floor(number / 10)]}十${numerals[number % 10]}`;
    return String(number);
  }

  function isDynamicClauseTitle(title) {
    const text = String(title || "").trim();
    return text === "三、档期与流程" || text === "四、推广费用与支付";
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

  function normalizedClauseTemplateOptions() {
    return normalizeClauseVersions(store.clauseVersions).slice().sort((left, right) => (
      latestTimestamp([right.updatedAt]) - latestTimestamp([left.updatedAt])
    ));
  }

  function clauseEditorDraft(version) {
    if (!version) {
      return {
        versionName: "",
        sections: clone(DEFAULT_CLAUSES),
      };
    }
    const draft = clauseEditorDraftByVersionId.get(version.id);
    if (draft && Array.isArray(draft.sections) && draft.sections.length) {
      return clone(draft);
    }
    return {
      versionName: version.version || "",
      sections: clone(version.sections || DEFAULT_CLAUSES),
    };
  }

  function collectClauseEditorDraft(version) {
    const versionNameInput = document.getElementById("clauseVersionName");
    const versionName = String(versionNameInput ? versionNameInput.value : "").trim() || (version && version.version) || "";
    const blocks = Array.from(document.querySelectorAll('.clause-item[data-clause-editable="true"]'));
    const tailSections = blocks.length
      ? blocks.map((block, index) => {
        const titleInput = block.querySelector('[data-clause-field="title"]');
        const bodyInput = block.querySelector('[data-clause-field="body"]');
        const title = (titleInput ? titleInput.value.trim() : "") || getIn(DEFAULT_CLAUSES, [index + 2, "title"]) || buildDefaultTailClauseTitle(index);
        const bodyText = bodyInput ? bodyInput.value : "";
        const body = bodyText
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean);
        return { title, body: body.length ? body : makeDefaultTailClauseSection(index).body };
      })
      : normalizeTailClauseSections(getIn(version, ["sections"]) || DEFAULT_CLAUSES, DEFAULT_CLAUSES.slice(2));
    return { versionName, sections: [...clone(DEFAULT_CLAUSES.slice(0, 2)), ...tailSections] };
  }

  function captureClauseEditorDraftFromDom() {
    const version = activeClauseVersion();
    if (!version) return;
    const list = document.getElementById("clauseList");
    if (!list || !list.children.length) return;
    clauseEditorDraftByVersionId.set(version.id, collectClauseEditorDraft(version));
  }

  function openInlineClauseEditor(token) {
    const nextToken = String(token || "").trim();
    if (!nextToken || !isInlineClauseTokenEditable(nextToken)) return;
    activeInlineClauseToken = nextToken;
    pendingInlineClauseFocusToken = nextToken;
    lockAdminPreview(8000);
    renderForm({ force: true, ignoreDefer: true });
  }

  function closeInlineClauseEditor(options = {}) {
    if (!activeInlineClauseToken) return;
    activeInlineClauseToken = "";
    pendingInlineClauseFocusToken = "";
    if (options.forceRefresh) {
      pendingAdminPreviewRefresh = false;
      renderForm({ force: true, ignoreDefer: true });
      renderPreview();
    }
  }

  function restoreInlineClauseEditorFocus() {
    if (!pendingInlineClauseFocusToken) return;
    const token = pendingInlineClauseFocusToken;
    pendingInlineClauseFocusToken = "";
    window.requestAnimationFrame(() => {
      const target = document.querySelector(`[data-inline-clause-editor="${token}"] [data-field-key]`);
      if (!target) return;
      target.focus();
      if (typeof target.select === "function" && target.tagName === "INPUT") target.select();
    });
  }

  function parseHashRoute() {
    signerWorkspaceId = "";
    signerWriteToken = "";
    signerPayloadContract = null;
    signerLinkWarning = "";
    signerRemoteLoading = false;
    const params = parseSignerParams();
    const workspaceId = params.get(SIGN_WORKSPACE_KEY) || "";
    const cloudToken = params.get(SIGN_CONTRACT_KEY) || "";
    const writeToken = params.get(SIGN_WRITE_KEY) || "";
    if (workspaceId && cloudToken) {
      signerToken = cloudToken;
      signerWorkspaceId = workspaceId;
      signerWriteToken = writeToken;
      signerPayloadContract = decodeSignPayload(params.get(SIGN_PAYLOAD_KEY) || params.get("payload"), signerToken);
      signerLinkWarning = hasSupabaseClientConfig()
        ? "正在加载线上合同..."
        : "当前页面尚未配置 Supabase，无法读取线上合同。";
      activeView = "signer";
      return;
    }
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
      signerWorkspaceId = "";
      signerWriteToken = "";
      signerUploadKey = "";
      resetSignerUpload();
    }
  }

  function applyAuthGate() {
    const authenticated = isAdminAuthenticated();
    document.body.classList.toggle("auth-locked", !signerToken && !authenticated);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const input = document.getElementById("authPassword");
    const message = document.getElementById("authMessage");
    if (!hasAdminCloudConfig()) {
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
      return;
    }
    if (!supabaseClient) {
      message.hidden = false;
      message.textContent = "Supabase 客户端未加载成功，请刷新页面后重试。";
      return;
    }
    message.hidden = false;
    message.textContent = "正在登录云端工作区...";
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: supabaseConfig.adminEmail,
        password: input.value,
      });
      if (error) throw error;
      adminSession = data.session || null;
      adminUser = data.user || (data.session ? data.session.user : null);
      localStorage.setItem(AUTH_KEY, "ok");
      input.value = "";
      message.hidden = true;
      applyAuthGate();
      await bootstrapRemoteWorkspace();
      renderAll();
      return;
    } catch (error) {
      message.hidden = false;
      message.textContent = friendlyCloudError(error, "登录失败，请检查密码或 Supabase 配置。");
      input.select();
    }
  }

  function normalizeSupabaseConfig(config) {
    const next = {
      url: String(config && config.url || "").trim().replace(/\/+$/, ""),
      anonKey: String(config && config.anonKey || "").trim(),
      adminEmail: String(config && config.adminEmail || "").trim(),
      workspaceId: String(config && config.workspaceId || "").trim(),
    };
    next.clientReady = Boolean(next.url && next.anonKey);
    next.adminReady = Boolean(next.clientReady && next.adminEmail && next.workspaceId);
    return next;
  }

  function normalizeSignerGatewayConfig(config) {
    const next = config && typeof config === "object" ? config : {};
    const value = typeof config === "string"
      ? config
      : next.baseUrl || next.url || "";
    const baseUrl = String(value || "").trim().replace(/\/+$/, "");
    const preferredDomain = String(next.preferredDomain || baseUrl || "").trim().replace(/\/+$/, "");
    const signerAppBaseUrl = String(next.signerAppBaseUrl || preferredDomain || baseUrl || "").trim().replace(/\/+$/, "");
    const adminAppBaseUrl = String(next.adminAppBaseUrl || "").trim().replace(/\/+$/, "");
    return {
      baseUrl,
      preferredDomain,
      signerAppBaseUrl,
      adminAppBaseUrl,
      enabled: Boolean(baseUrl),
    };
  }

  function createSupabaseBrowserClient() {
    try {
      if (!hasSupabaseClientConfig()) return null;
      if (!window.supabase || typeof window.supabase.createClient !== "function") return null;
      return window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (error) {
      console.warn("Failed to create Supabase client", error);
      return null;
    }
  }

  function hasSupabaseClientConfig() {
    return Boolean(supabaseConfig.clientReady);
  }

  function hasAdminCloudConfig() {
    return Boolean(supabaseConfig.adminReady);
  }

  function isAdminAuthenticated() {
    if (hasAdminCloudConfig()) return Boolean(adminSession);
    return localStorage.getItem(AUTH_KEY) === "ok";
  }

  function isAdminCloudReady() {
    return Boolean(hasAdminCloudConfig() && supabaseClient && adminSession && adminUser);
  }

  async function initializeSupabaseSession() {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      adminSession = session || null;
      adminUser = session && session.user ? session.user : null;
      if (adminSession) {
        localStorage.setItem(AUTH_KEY, "ok");
        applyAuthGate();
        renderAll();
        await bootstrapRemoteWorkspace();
      } else {
        localStorage.removeItem(AUTH_KEY);
        adminSession = null;
        adminUser = null;
        remoteBootstrapDone = false;
        stopRemoteSubscription();
        stopRemotePolling();
        applyAuthGate();
        renderAll();
      }
    });
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      remoteSyncState.lastError = friendlyCloudError(error, "读取 Supabase 会话失败。");
      return;
    }
    adminSession = data.session || null;
    adminUser = adminSession && adminSession.user ? adminSession.user : null;
    if (adminSession) {
      localStorage.setItem(AUTH_KEY, "ok");
    }
  }

  async function bootstrapRemoteWorkspace() {
    if (!isAdminCloudReady()) return false;
    try {
      startRemoteSubscription();
      startRemotePolling();
      if (remoteBootstrapDone) {
        return pullRemoteWorkspace("bootstrap-refresh");
      }
      remoteBootstrapDone = true;
      const row = await fetchRemoteWorkspaceState();
      if (row && row.payload && Array.isArray(row.payload.contracts) && row.payload.contracts.length) {
        applyRemoteStorePayload(row.payload, "bootstrap");
        remoteSyncState.connected = true;
        remoteSyncState.lastPulledAt = nowIso();
        remoteSyncState.lastError = "";
        renderTopState();
        return true;
      }
      await upsertRemoteWorkspaceState(store, "bootstrap-import");
      remoteSyncState.connected = true;
      remoteSyncState.lastPushedAt = nowIso();
      remoteSyncState.lastError = "";
      renderTopState();
      return true;
    } catch (error) {
      remoteSyncState.lastError = friendlyCloudError(error, "云端工作区初始化失败。");
      renderTopState();
      return false;
    }
  }

  function startRemoteSubscription() {
    if (!isAdminCloudReady() || remoteChannel) return;
    remoteChannel = supabaseClient
      .channel(`workspace:${supabaseConfig.workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: WORKSPACE_TABLE,
          filter: `workspace_id=eq.${supabaseConfig.workspaceId}`,
        },
        () => {
          pullRemoteWorkspace("realtime");
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          remoteSyncState.connected = true;
          remoteSyncState.lastError = "";
          renderTopState();
        }
      });
  }

  function stopRemoteSubscription() {
    if (!supabaseClient || !remoteChannel) return;
    try {
      supabaseClient.removeChannel(remoteChannel);
    } catch (error) {
      console.warn("Failed to remove Supabase channel", error);
    }
    remoteChannel = null;
  }

  function startRemotePolling() {
    if (remotePollTimer || !hasSupabaseClientConfig()) return;
    remotePollTimer = window.setInterval(() => {
      if (!isAdminCloudReady()) return;
      if (document.hidden) return;
      if (activeView === "signer" || signerToken) return;
      pullRemoteWorkspace("poll");
    }, REMOTE_POLL_INTERVAL_MS);
  }

  function stopRemotePolling() {
    if (!remotePollTimer) return;
    clearInterval(remotePollTimer);
    remotePollTimer = 0;
  }

  function scheduleRemoteStoreSync(reason, immediate) {
    if (!isAdminCloudReady() || applyingRemoteStore) return;
    if (remoteSyncTimer) {
      clearTimeout(remoteSyncTimer);
      remoteSyncTimer = 0;
    }
    if (immediate) {
      flushRemoteStore(reason);
      return;
    }
    remoteSyncTimer = window.setTimeout(() => {
      remoteSyncTimer = 0;
      flushRemoteStore(reason);
    }, REMOTE_SYNC_DEBOUNCE_MS);
  }

  function flushRemoteStore(reason) {
    if (!isAdminCloudReady() || applyingRemoteStore) return Promise.resolve(false);
    if (remoteSyncTimer) {
      clearTimeout(remoteSyncTimer);
      remoteSyncTimer = 0;
    }
    return runRemoteSyncTask(async () => {
      await upsertRemoteWorkspaceState(store, reason);
      remoteSyncState.connected = true;
      remoteSyncState.lastPushedAt = nowIso();
      remoteSyncState.lastError = "";
      renderTopState();
      return true;
    }).catch((error) => {
      remoteSyncState.lastError = friendlyCloudError(error, "云端保存失败。");
      renderTopState();
      return false;
    });
  }

  function pullRemoteWorkspace(reason) {
    if (!isAdminCloudReady()) return Promise.resolve(false);
    return runRemoteSyncTask(async () => {
      const row = await fetchRemoteWorkspaceState();
      if (row && row.payload) {
        applyRemoteStorePayload(row.payload, reason);
        remoteSyncState.connected = true;
        remoteSyncState.lastPulledAt = nowIso();
        remoteSyncState.lastError = "";
        renderTopState();
        return true;
      }
      return false;
    }).catch((error) => {
      remoteSyncState.lastError = friendlyCloudError(error, "读取云端合同失败。");
      renderTopState();
      return false;
    });
  }

  function runRemoteSyncTask(task) {
    remoteSyncState.syncing = true;
    renderTopState();
    const runner = remoteSyncQueue.then(task);
    remoteSyncQueue = runner.catch(() => {});
    return runner.finally(() => {
      remoteSyncState.syncing = false;
      renderTopState();
    });
  }

  async function fetchRemoteWorkspaceState() {
    const { data, error } = await withTimeout(
      supabaseClient
        .from(WORKSPACE_TABLE)
        .select("workspace_id,payload,updated_at")
        .eq("workspace_id", supabaseConfig.workspaceId)
        .maybeSingle(),
      REMOTE_REQUEST_TIMEOUT_MS,
      "Cloud workspace read timed out. Please check the network connection.",
    );
    if (error) throw error;
    return data || null;
  }

  async function upsertRemoteWorkspaceState(nextStore, reason, attempt = 0) {
    const localPayload = normalizeStoreState(clone(nextStore));
    const remoteRow = await fetchRemoteWorkspaceState();
    const payload = remoteRow && remoteRow.payload
      ? mergeStoreStates(remoteRow.payload, localPayload)
      : localPayload;
    if (!remoteRow) {
      const { error } = await withTimeout(
        supabaseClient
          .from(WORKSPACE_TABLE)
          .insert({
            workspace_id: supabaseConfig.workspaceId,
            owner_id: adminUser.id,
            payload,
          })
          .select("workspace_id")
          .single(),
        REMOTE_REQUEST_TIMEOUT_MS,
        "Cloud workspace save timed out. Please try again.",
      );
      if (error) {
        if (attempt < REMOTE_SAVE_RETRY_LIMIT && isRetryableWorkspaceConflict(error)) {
          return upsertRemoteWorkspaceState(localPayload, reason, attempt + 1);
        }
        throw error;
      }
      return reason;
    }
    const { data, error } = await withTimeout(
      supabaseClient
        .from(WORKSPACE_TABLE)
        .update({
          owner_id: adminUser.id,
          payload,
        })
        .eq("workspace_id", supabaseConfig.workspaceId)
        .eq("updated_at", remoteRow.updated_at)
        .select("workspace_id,updated_at")
        .maybeSingle(),
      REMOTE_REQUEST_TIMEOUT_MS,
      "Cloud workspace save timed out. Please try again.",
    );
    if (error) throw error;
    if (!data) {
      if (attempt < REMOTE_SAVE_RETRY_LIMIT) {
        return upsertRemoteWorkspaceState(localPayload, reason, attempt + 1);
      }
      throw new Error("Cloud workspace changed on another device. Please retry.");
    }
    return reason;
  }

  function applyRemoteStorePayload(payload, _reason) {
    applyingRemoteStore = true;
    store = mergeStoreStates(payload, store);
    saveStore(false, { skipRemote: true });
    applyingRemoteStore = false;
    renderAll();
  }

  function mergeStoreStates(remotePayload, localPayload) {
    const remote = normalizeStoreState(clone(remotePayload));
    const local = normalizeStoreState(clone(localPayload));
    const deletedContracts = normalizeDeletedContracts([
      ...remote.deletedContracts,
      ...local.deletedContracts,
    ]);
    const tombstones = new Map(deletedContracts.map((item) => [deletedContractKey(item), item]));
    const contractMap = new Map();
    [...remote.contracts, ...local.contracts].forEach((item) => {
      const contract = normalizeContract(item);
      const key = contractIdentityKey(contract);
      const existing = contractMap.get(key);
      if (!existing || contractTimestamp(contract) >= contractTimestamp(existing)) {
        contractMap.set(key, contract);
      }
    });
    const contracts = Array.from(contractMap.values())
      .filter((contract) => {
        const tombstone = tombstones.get(contractIdentityKey(contract));
        return !tombstone || contractTimestamp(contract) > deletedContractTimestamp(tombstone);
      })
      .sort((left, right) => contractTimestamp(right) - contractTimestamp(left));
    const clauseVersions = mergeClauseVersions(remote.clauseVersions, local.clauseVersions);
    const mergedBrandOptions = mergeManagedOptions(remote, local, "brandOptions", DEFAULT_BRAND_OPTIONS);
    const mergedPlatformOptions = mergeManagedOptions(remote, local, "platformOptions", DEFAULT_PLATFORM_OPTIONS);
    const merged = {
      selectedId: contracts.some((contract) => contract.id === local.selectedId)
        ? local.selectedId
        : contracts.some((contract) => contract.id === remote.selectedId)
          ? remote.selectedId
          : contracts[0] && contracts[0].id || "",
      contracts,
      deletedContracts,
      brandOptions: mergedBrandOptions.values,
      platformOptions: mergedPlatformOptions.values,
      brandOptionsUpdatedAt: mergedBrandOptions.updatedAt,
      platformOptionsUpdatedAt: mergedPlatformOptions.updatedAt,
      clauseVersions,
      activeClauseVersionId: resolveActiveClauseVersionId(
        clauseVersions,
        local.activeClauseVersionId,
        remote.activeClauseVersionId,
      ),
      lastAppliedClauseSeed: CLAUSE_SEED_VERSION,
    };
    return normalizeStoreState(merged);
  }

  async function loadSignerContractFromCloud(options = {}) {
    if (!signerWorkspaceId || !signerToken) return null;
    if (!hasSupabaseClientConfig()) {
      signerLinkWarning = "Supabase is not configured. The online contract cannot be loaded.";
      renderAll();
      return null;
    }
    const key = currentSignerRequestKey();
    const now = Date.now();
    const hydratedFromSession = !options.force && hydrateSignerContractFromSessionCache(key);
    if (!options.force && !hydratedFromSession && signerPayloadContract && signerLastLoadedKey === key && now - signerLastLoadedAt < SIGNER_LOAD_CACHE_MS) {
      return signerPayloadContract;
    }
    if (!options.force && signerLoadPromise && signerLoadKey === key) {
      return signerLoadPromise;
    }
    signerLoadKey = key;
    signerRemoteLoading = true;
    signerLinkWarning = signerPayloadContract ? "正在刷新最新合同..." : "正在连接合同服务...";
    renderAll();
    signerLoadPromise = (async () => {
      try {
        signerLinkWarning = "正在读取线上合同...";
        renderAll();
        const remoteContract = await fetchSignerContractWithRetry();
        signerPayloadContract = normalizeContract(remoteContract);
        signerLastLoadedKey = key;
        signerLastLoadedAt = Date.now();
        signerLinkWarning = "";
        mergeRemoteContractIntoLocalStore(signerPayloadContract);
        storeSignerContractSessionCache(key, signerPayloadContract);
        return signerPayloadContract;
      } catch (error) {
        signerLinkWarning = friendlyCloudError(error, "Online contract failed to load. Please check the network or ask party A to publish again.");
        throw error;
      } finally {
        signerRemoteLoading = false;
        if (signerLoadKey === key) {
          signerLoadPromise = null;
        }
        renderAll();
      }
    })();
    return signerLoadPromise;
  }

  function currentSignerRequestKey() {
    return [signerWorkspaceId || "", signerToken || "", signerWriteToken || ""].join("|");
  }

  function signerSessionCacheKey(key) {
    return `${SIGNER_SESSION_CACHE_PREFIX}${key}`;
  }

  function hydrateSignerContractFromSessionCache(key) {
    try {
      const raw = sessionStorage.getItem(signerSessionCacheKey(key));
      if (!raw) return false;
      const cached = JSON.parse(raw);
      if (!cached || !cached.contract) return false;
      signerPayloadContract = normalizeContract(cached.contract);
      signerLastLoadedKey = key;
      signerLastLoadedAt = Number(cached.at || 0);
      signerLinkWarning = "已显示上次加载的合同，正在刷新最新状态...";
      renderAll();
      return true;
    } catch (error) {
      return false;
    }
  }

  function storeSignerContractSessionCache(key, contract) {
    try {
      sessionStorage.setItem(signerSessionCacheKey(key), JSON.stringify({
        at: Date.now(),
        contract: normalizeContract(contract),
      }));
    } catch (error) {
      // Session cache is an experience optimization only.
    }
  }

  async function fetchSignerContractFromCloud() {
    const response = await callSignerFunction("GET");
    if (!response || !response.contract) {
      throw new Error("未找到对应的线上合同。");
    }
    return response.contract;
  }

  async function fetchSignerContractWithTimeout() {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("线上合同加载超时，请检查网络连接。")), SIGNER_LOAD_TIMEOUT_MS)
    );
    return Promise.race([fetchSignerContractFromCloud(), timeoutPromise]);
  }

  async function fetchSignerContractWithRetry() {
    try {
      return await fetchSignerContractWithTimeout();
    } catch (error) {
      if (!isRetryableSignerLoadError(error)) throw error;
      signerLinkWarning = "线上合同加载较慢，正在重试...";
      renderAll();
      await wait(SIGNER_LOAD_RETRY_DELAY_MS);
      return fetchSignerContractWithTimeout();
    }
  }

  function isRetryableSignerLoadError(error) {
    const message = error && error.message ? String(error.message) : "";
    return /timeout|Failed to fetch|ERR_FAILED|ERR_CONNECTION_CLOSED/i.test(message);
  }

  async function submitRemoteSignatureWithFallback(payload) {
    try {
      return await submitRemoteSignature(payload, { withFallback: false });
    } catch (error) {
      if (!isMissingContractSignerError(error)) throw error;
      showSignMessage("合同服务正在恢复签署数据，请稍候...", "ok");
      return submitRemoteSignature(payload, { withFallback: true });
    }
  }

  async function submitRemoteSignature(payload, options = {}) {
    const body = {
      ws: signerWorkspaceId,
      ct: signerToken,
      wt: signerWriteToken,
      signerName: payload.signerName,
      imageData: payload.imageData,
      userAgent: payload.userAgent,
    };
    if (options.withFallback) {
      body.fallbackContract = buildSignerFallbackContract(signerContract());
    }
    const response = await callSignerFunction("POST", body);
    if (!response || !response.contract) {
      throw new Error("签署结果返回不完整。");
    }
    return response.contract;
  }

  function isMissingContractSignerError(error) {
    const message = error && error.message ? String(error.message) : "";
    if (/invalid|expired|permission|not allowed|Forbidden|失效|权限/i.test(message)) return false;
    return /not found|missing contract|workspace|未找到|找不到|工作区|对应的合同/i.test(message);
  }

  function startSignerSubmitSlowNotice() {
    clearSignerSubmitSlowNotice();
    signerSubmitSlowTimer = window.setTimeout(() => {
      signerSubmitSlowTimer = 0;
      if (!signerSubmitInProgress) return;
      showSignMessage("网络较慢，请勿关闭页面，签名正在安全同步给甲方。", "ok");
    }, SIGNER_SUBMIT_SLOW_NOTICE_MS);
  }

  function clearSignerSubmitSlowNotice() {
    if (!signerSubmitSlowTimer) return;
    clearTimeout(signerSubmitSlowTimer);
    signerSubmitSlowTimer = 0;
  }

  function confirmSignerCloudSyncInBackground() {
    const requestKey = currentSignerRequestKey();
    fetchSignerContractFromCloud()
      .then((remoteContract) => {
        if (requestKey !== currentSignerRequestKey()) return;
        signerPayloadContract = normalizeContract(remoteContract);
        signerLastLoadedKey = requestKey;
        signerLastLoadedAt = Date.now();
        signerLinkWarning = "";
        mergeRemoteContractIntoLocalStore(signerPayloadContract);
        storeSignerContractSessionCache(requestKey, signerPayloadContract);
        renderAll();
      })
      .catch(() => {
        if (requestKey !== currentSignerRequestKey()) return;
        showSignMessage("签署已提交，后台确认较慢；如页面未更新，可刷新后查看。", "ok");
      });
  }

  async function callSignerFunction(method, body) {
    return callSignerFunctionForParams(method, {
      [SIGN_WORKSPACE_KEY]: signerWorkspaceId,
      [SIGN_CONTRACT_KEY]: signerToken,
      [SIGN_WRITE_KEY]: signerWriteToken,
    }, body);
  }

  async function callSignerFunctionForParams(method, params, body) {
    if (!hasSupabaseClientConfig()) {
      throw new Error("Supabase is not configured.");
    }
    const url = method === "GET"
      ? `${buildSupabaseFunctionUrl()}?${buildQueryString(params || {})}`
      : buildSupabaseFunctionUrl();
    const response = await fetch(url, {
      method,
      ...(method === "POST"
        ? {
            headers: {
              "Content-Type": "text/plain;charset=UTF-8",
            },
            body: JSON.stringify(body || {}),
          }
        : {}),
    });
    const text = await response.text();
    const data = parseSignerResponse(text);
    if (!response.ok) {
      throw new Error(normalizeSignerError(data, text));
    }
    return data;
  }

  function parseSignerResponse(text) {
    try {
      return text ? JSON.parse(text) : {};
    } catch (error) {
      return { error: summarizeResponseText(text) };
    }
  }

  function normalizeSignerError(data, rawText) {
    const message = data && data.error ? String(data.error) : summarizeResponseText(rawText);
    if (/Internal Server Error/i.test(message)) return "Signer service is temporarily unavailable. Please retry.";
    if (/timeout|timed out/i.test(message)) return "Signer submission timed out. Please retry.";
    if (/Forbidden|invalid|expired|permission|not allowed/i.test(message)) return "Signer link is invalid. Please ask party A to publish again.";
    return message || "Signer service request failed. Please retry.";
  }

  function summarizeResponseText(text) {
    const clean = String(text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return clean.slice(0, 160) || "Signer service response was invalid.";
  }

  function buildSupabaseFunctionUrl() {
    if (isSignerAppHost()) {
      return `/${SUPABASE_FUNCTION_NAME}`;
    }
    if (signerGatewayConfig.enabled) {
      return `${signerGatewayConfig.baseUrl}/${SUPABASE_FUNCTION_NAME}`;
    }
    return `${supabaseConfig.url}/functions/v1/${SUPABASE_FUNCTION_NAME}`;
  }

  function friendlyCloudError(error, fallbackMessage) {
    const message = error && error.message ? String(error.message) : "";
    if (!message) return fallbackMessage;
    if (/Invalid login credentials/i.test(message)) return "密码错误，请重新输入。";
    if (/timeout/i.test(message)) return "线上合同加载超时，请稍后重试或改用系统浏览器打开。";
    if (/workspace|contract|未找到对应的合同|未找到对应的合同工作区/i.test(message)) {
      return "签署链接已失效或合同未同步，请联系甲方重新发布。";
    }
    if (/Failed to fetch|ERR_FAILED|ERR_CONNECTION_CLOSED/i.test(message)) {
      return "当前网络或浏览器拦截了线上请求，请尝试系统浏览器打开。";
    }
    if (/JWT|permission|not allowed|Forbidden|权限无效/i.test(message)) {
      return "签署链接已失效，请联系甲方重新发布。";
    }
    return message;
  }

  function wait(durationMs) {
    return new Promise((resolve) => setTimeout(resolve, durationMs));
  }

  function buildSignLink(contract) {
    if (hasAdminCloudConfig()) {
      contract.signWriteToken = contract.signWriteToken || randomToken(24);
      return `${getSignerAppBaseUrl()}?${buildQueryString({
        [SIGN_WORKSPACE_KEY]: supabaseConfig.workspaceId,
        [SIGN_CONTRACT_KEY]: contract.token,
        [SIGN_WRITE_KEY]: contract.signWriteToken,
      })}`;
    }
    const payload = encodeSignPayload(contract);
    return `${getUrlBase()}?${buildQueryString({
      [SIGN_HASH_KEY]: contract.token,
      [SIGN_PAYLOAD_KEY]: payload,
    })}`;
  }

  function shareLinkStateKey(contract) {
    return contractIdentityKey(contract);
  }

  function getShareLinkState(contract) {
    if (!contract) return null;
    const key = shareLinkStateKey(contract);
    if (!shareLinkState[key]) {
      shareLinkState[key] = {
        link: "",
        checkedWt: "",
        validating: false,
        error: "",
        promise: null,
      };
    }
    return shareLinkState[key];
  }

  function renderShareLink(contract) {
    const input = document.getElementById("shareLink");
    const copyButton = document.getElementById("copyLinkBtn");
    if (!contract) {
      input.value = "";
      input.placeholder = "";
      copyButton.disabled = true;
      return;
    }
    if (!hasAdminCloudConfig()) {
      input.value = buildSignLink(contract);
      input.placeholder = "";
      copyButton.disabled = !input.value;
      return;
    }
    const state = getShareLinkState(contract);
    const sameToken = state.checkedWt && state.checkedWt === contract.signWriteToken;
    input.value = sameToken ? state.link : "";
    input.placeholder = state.validating
      ? "正在校验签署链接..."
      : (state.error || "正在准备签署链接...");
    copyButton.disabled = state.validating || !input.value;
  }

  function queueShareLinkValidation(contract, options = {}) {
    if (!contract || !hasAdminCloudConfig()) return Promise.resolve("");
    if (!["published", "confirmed", "signed"].includes(contract.status)) return Promise.resolve("");
    const state = getShareLinkState(contract);
    if (state.promise) return state.promise;
    if (!options.forceValidate) {
      if (state.link && state.checkedWt === contract.signWriteToken) return Promise.resolve(state.link);
      if (!state.link && state.error && state.checkedWt === contract.signWriteToken) return Promise.resolve("");
    }
    return ensureValidShareLink(contract, options).catch(() => "");
  }

  async function ensureValidShareLink(contract, options = {}) {
    if (!contract) return "";
    if (!hasAdminCloudConfig()) return buildSignLink(contract);
    const state = getShareLinkState(contract);
    if (state.promise) return state.promise;
    if (!options.forceValidate && state.link && state.checkedWt === contract.signWriteToken) {
      return state.link;
    }
    state.validating = true;
    state.error = "";
    const current = currentContract();
    if (current && shareLinkStateKey(current) === shareLinkStateKey(contract)) {
      renderShareLink(current);
    }
    const key = shareLinkStateKey(contract);
    state.promise = (async () => {
      let target = findContractByIdentity(contract) || contract;
      try {
        const validLink = await verifyShareLink(target);
        state.link = validLink;
        state.checkedWt = target.signWriteToken;
        state.error = "";
        return validLink;
      } catch (error) {
        if (isInvalidShareLinkError(error)) {
          target = await refreshShareLinkToken(target);
          const refreshedLink = await verifyShareLink(target);
          state.link = refreshedLink;
          state.checkedWt = target.signWriteToken;
          state.error = "";
          document.getElementById("syncState").textContent = "签署链接已自动刷新";
          return refreshedLink;
        }
        state.link = "";
        state.checkedWt = target.signWriteToken;
        state.error = friendlyCloudError(error, "签署链接校验失败，请稍后重试。");
        throw error;
      } finally {
        const finalState = shareLinkState[key];
        if (finalState) {
          finalState.validating = false;
          finalState.promise = null;
        }
        const visible = currentContract();
        if (visible && shareLinkStateKey(visible) === key) {
          renderShareLink(visible);
        }
      }
    })();
    return state.promise;
  }

  async function verifyShareLink(contract) {
    const target = findContractByIdentity(contract) || contract;
    if (!target || !target.token || !target.signWriteToken) {
      throw new Error("当前合同缺少有效的签署链接参数。");
    }
    await callSignerFunctionForParams("GET", {
      [SIGN_WORKSPACE_KEY]: supabaseConfig.workspaceId,
      [SIGN_CONTRACT_KEY]: target.token,
      [SIGN_WRITE_KEY]: target.signWriteToken,
    });
    return buildSignLink(target);
  }

  async function refreshShareLinkToken(contract) {
    const target = findContractByIdentity(contract) || contract;
    if (!target) throw new Error("未找到需要刷新的合同。");
    target.signWriteToken = randomToken(24);
    target.updatedAt = nowIso();
    saveStore(true, { reason: "refresh-sign-link", skipRemote: true });
    const synced = await flushRemoteStore("refresh-sign-link");
    if (!synced) {
      throw new Error("签署链接刷新后云端保存失败，请稍后重试。");
    }
    return findContractByIdentity(target) || target;
  }

  function isInvalidShareLinkError(error) {
    const message = error && error.message ? String(error.message) : "";
    return /签署链接已失效|权限无效|未找到对应的合同|未找到对应的合同工作区|Forbidden|not allowed/i.test(message);
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
        signedAt: signature ? signature.signedAt || "" : "",
        confirmedAt: signature ? signature.confirmedAt || "" : "",
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
      if (fieldKey === "amountUpper" || fieldKey === "promotionServiceFeeUpper") return;
      const rawValue = fields ? fields[fieldKey] : null;
      if (rawValue == null) return;
      const value = String(rawValue).trim();
      if (!value) return;
      if (String(DEFAULT_FIELDS[fieldKey] == null ? "" : DEFAULT_FIELDS[fieldKey]).trim() === value) return;
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
    if (!Object.prototype.hasOwnProperty.call(rawFields, "promotionServiceFee")) {
      fields.promotionServiceFee = fields.price || DEFAULT_FIELDS.price;
    }
    fields.promotionServiceFeeUpper = moneyToChinese(fields.promotionServiceFee) || DEFAULT_FIELDS.promotionServiceFeeUpper;
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
    if (!signature || !signature.imageData) return null;
    return {
      n: signature.signerName || "",
      i: signature.imageData,
      c: signature.confirmedAt || "",
      d: signature.signedAt || "",
      h: signature.snapshotHash || "",
    };
  }

  function expandSignature(signature) {
    if (!signature || !signature.i) return null;
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
    if (localContract.snapshot && !localContract.snapshot.fields) {
      localContract.snapshot.fields = {};
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
    if (getIn(localContract, ["snapshot", "fields"])) {
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
    if (changed) saveStore(false, { skipRemote: true });
  }

  function buildSignerFallbackContract(contract) {
    if (!contract) return null;
    return {
      id: contract.id || "",
      token: contract.token || "",
      status: contract.status || "published",
      fields: clone(contract.fields || {}),
      snapshot: clone(contract.snapshot || null),
      signature: clone(contract.signature || null),
      confirmedAt: contract.confirmedAt || "",
      signedAt: contract.signedAt || "",
      publishedAt: contract.publishedAt || "",
      updatedAt: contract.updatedAt || "",
      createdAt: contract.createdAt || "",
    };
  }

  function parseSignerParams() {
    const searchParams = createParamBag(location.search);
    if (
      searchParams.get(SIGN_WORKSPACE_KEY)
      || searchParams.get(SIGN_CONTRACT_KEY)
      || searchParams.get(SIGN_HASH_KEY)
      || searchParams.get("sign")
    ) return searchParams;
    return createParamBag(location.hash);
  }

  function isSignerRoute() {
    const searchParams = createParamBag(location.search);
    if (
      searchParams.get(SIGN_WORKSPACE_KEY)
      || searchParams.get(SIGN_CONTRACT_KEY)
      || searchParams.get(SIGN_HASH_KEY)
      || searchParams.get("sign")
    ) return true;
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
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
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

  function buildReverseMap(source) {
    const target = {};
    Object.keys(source || {}).forEach((key) => {
      target[source[key]] = key;
    });
    return target;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getIn(target, path) {
    let current = target;
    for (let index = 0; index < path.length; index += 1) {
      if (current == null) return undefined;
      current = current[path[index]];
    }
    return current;
  }

  function matchesSelector(element, selector) {
    if (!element) return false;
    const matcher = element.matches || element.msMatchesSelector || element.webkitMatchesSelector;
    return typeof matcher === "function" ? matcher.call(element, selector) : false;
  }

  function getClosest(element, selector) {
    if (!element) return null;
    if (typeof element.closest === "function") return element.closest(selector);
    let current = element.nodeType === 1 ? element : element.parentElement;
    while (current) {
      if (matchesSelector(current, selector)) return current;
      current = current.parentElement;
    }
    return null;
  }

  function decodeQueryValue(value) {
    try {
      return decodeURIComponent(String(value || "").replace(/\+/g, "%20"));
    } catch (error) {
      return String(value || "");
    }
  }

  function createParamBag(text) {
    const source = String(text || "").replace(/^[?#]/, "");
    const map = {};
    if (source) {
      source.split("&").forEach((part) => {
        if (!part) return;
        const segments = part.split("=");
        const key = decodeQueryValue(segments.shift());
        const value = decodeQueryValue(segments.join("="));
        if (!key) return;
        map[key] = value;
      });
    }
    return {
      get(key) {
        return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
      },
    };
  }

  function buildQueryString(params) {
    return Object.keys(params || {})
      .filter((key) => params[key] != null && params[key] !== "")
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
      .join("&");
  }

  function withTimeout(promise, timeoutMs, message) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  }

  function contractIdentityKey(contract) {
    const token = String(contract && contract.token || "").trim();
    if (token) return `token:${token}`;
    return `id:${String(contract && contract.id || "").trim()}`;
  }

  function deletedContractKey(item) {
    const token = String(item && item.token || "").trim();
    if (token) return `token:${token}`;
    return `id:${String(item && item.id || "").trim()}`;
  }

  function contractTimestamp(contract) {
    return latestTimestamp([
      contract && contract.updatedAt,
      contract && contract.signedAt,
      contract && contract.confirmedAt,
      contract && contract.publishedAt,
      contract && contract.createdAt,
    ]);
  }

  function deletedContractTimestamp(item) {
    return latestTimestamp([item && item.deletedAt]);
  }

  function latestTimestamp(values) {
    let latest = 0;
    (Array.isArray(values) ? values : []).forEach((value) => {
      const time = Date.parse(String(value || ""));
      if (Number.isFinite(time) && time > latest) latest = time;
    });
    return latest;
  }

  function isRetryableWorkspaceConflict(error) {
    const code = String(error && error.code || "").trim();
    const message = String(error && error.message || "").trim();
    return code === "23505" || /duplicate/i.test(message) || /conflict/i.test(message);
  }

  function mergeClauseVersions(remoteVersions, localVersions) {
    const map = new Map();
    [...normalizeClauseVersions(remoteVersions), ...normalizeClauseVersions(localVersions)].forEach((version) => {
      const existing = map.get(version.id);
      const nextTime = latestTimestamp([version.updatedAt]);
      const currentTime = existing ? latestTimestamp([existing.updatedAt]) : -1;
      if (!existing || nextTime >= currentTime) {
        map.set(version.id, version);
      }
    });
    return Array.from(map.values());
  }

  function resolveActiveClauseVersionId(versions, preferredId, fallbackId) {
    if (versions.some((version) => version.id === preferredId)) return preferredId;
    if (versions.some((version) => version.id === fallbackId)) return fallbackId;
    return versions[versions.length - 1] && versions[versions.length - 1].id || "";
  }

  function getUrlBase() {
    if (location.protocol && location.host) return `${location.protocol}//${location.host}${location.pathname}`;
    return location.pathname;
  }

  function getSignerAppBaseUrl() {
    return signerGatewayConfig.signerAppBaseUrl || signerGatewayConfig.preferredDomain || getUrlBase();
  }

  function normalizeOrigin(value) {
    const text = String(value || "").trim().replace(/\/+$/, "");
    if (!text) return "";
    try {
      return new URL(text).origin;
    } catch (error) {
      return "";
    }
  }

  function isSignerAppHost() {
    const signerOrigin = normalizeOrigin(getSignerAppBaseUrl());
    return Boolean(signerOrigin && signerOrigin === location.origin);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeSvgText(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();

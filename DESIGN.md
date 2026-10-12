# Design

## Context

个人观展工具。白天园区查地图，展区找品牌，夜间查看演出时间。默认跟随系统，支持浅色与深色。

## Color

中性底色、橙红强调色；OKLCH变量在 src/index.css 中维护。橙红用于日期选择、定位、收藏状态和首页展期信息。全景中类型颜色辅助识别，配合列标题、图例与详情文字。

## Typography

中文系统无衬线字体；时间、编号和技术标识使用系统等宽字体。正文约13–15px，移动端标题约25–27px。标题与内容允许换行。

## Layout

手机顶部Header左侧为「交流方式观展手册」首页入口，右侧为全局菜单；搜索收纳于菜单顶部；菜单包含五个主要入口和参观须知，标明当前页面。桌面固定侧栏。列表行作为主要信息单元。单日全景时间向下、舞台并列、时间刻度与表头固定。展期总览统一时间刻度，五天按活动类型分栏。地图层级为场馆、一层、二层、功能分区。

## Components

统一44px按钮、日期选择器、书签、详情事实列表、地图目的地链接、来源链接、空状态。角半径约4–8px，使用细边框而非装饰阴影。

## Interaction

活动、展商、地图与个人收藏相互关联。筛选和视图写入路由参数。地图为依据原图的示意定位，不提供精确室内导航。未知时长仅表示起点；时间块高度不代表未知活动的持续时间。

## Motion

短暂收藏通知和控件状态反馈；尊重 prefers-reduced-motion。

## Responsive adaptation

手机小于640px：单列、顶部全局菜单、触控优先；输入字体16px避免移动浏览器自动放大。640px起：80px紧凑侧栏；768px起展商目录双列，首页与参观须知根据空间并排。1024px起完整侧栏与详情双栏；地图在各屏宽都优先占据主区域，定位信息按需展开。1280px起紧凑日程列宽自动适应；详情面板提供完整名称及完整介绍。超宽屏有内容最大宽度，地图与时间轴只在自身容器内滚动。

全景日程作为完整面板呈现：顶部标题、场次数量、紧凑范围切换与全屏入口同一行；日期和筛选内置于控制区；下方时间轴与图例/操作说明统一在面板内，图例和说明默认折叠，可展开/收起。桌面控制区并排，手机竖向排列，横屏压缩控制区。窗口全屏使用原时间轴，保留当前筛选、日期与滚动位置；Esc按层级先关闭详情面板，再退出全屏。

日程类型采用两级结构：「活动」包含现场演出、Afterparty、特别活动；「课程」包含讲座／演示、DIY 工作坊、大师课。列表与全景共享一行筛选栏：类型、场馆、只看我的。类型通过同一个自定义分组选择器提供全部类型、全部活动、全部课程及各细分类，不再单独增加大类切换。选择任意类型一次更新完整分类条件；筛选状态用强调色标识，切换视图保留条件。图例按大类分组，整个展期每个日期列先排列活动、再排列课程，列表和详情面板显示「大类 · 细分类」标签。

全景的单日日期切换采用独立的连续横向日期栏，高度52px、按钮点击区域44px。手机仅显示日期与星期；640px起日期、星期、筛选后的场次数并排显示，减少控制区高度。完整日期、提前活动标识和场次数保留在无障碍标签中；普通日程列表仍使用原日期卡片。

地图使用react-zoom-pan-pinch：双指缩放、拖动、双击放大、鼠标滚轮和键盘操作；查看全图按钮适配当前画布。手机画布横向铺满，工具悬浮于右上角，选中展位的信息出现在地图内。文字定位与场馆信息默认折叠，可从地图中的搜索按钮直达文字定位。删除重复场馆区块、常驻空选择框和细粒度缩放读数。

类型与场馆筛选共用 FilterSelect 自定义下拉组件：类型菜单显示活动／课程分组标题、缩进细分类及颜色点，选中项显示勾号。浮层通过 Popover 顶层呈现，避免被全屏日程裁切；根据屏幕空间向上或向下展开，限高后内部滚动。支持键盘方向键、Home／End、Enter、Escape、Tab及焦点恢复，滚动页面或改变窗口尺寸时收起。

## Visitor overview

首页围绕当前时间、个人安排与场馆位置组织，不再使用大封面或默认日期的前四条活动。展前以展期轮廓与收藏准备为主；展中优先下一场收藏（已知时段内可标记进行中，未知时长仅在开始后15分钟内提示已到开始时间），没有可提示的收藏时显示未来一小时最早开始的最多三场；展后保留个人安排和展期回看。日期与时间按北京时间计算，并依据已公布的跨午夜场次保留前一晚的展会日期。

当天轮廓将活动／课程的开始场次按小时聚合，显示收藏标记及当前时间，色块不代表持续时长。报名／购票入口、已知时段冲突、待核实地点仅依据尚未开始或有已知未结束时段的收藏显示，不推断是否完成报名。场馆入口与尚未标记逛过的收藏展商提供地图直达。手机按重要性单列，768px起将地图和展商置于侧栏。资料说明置于页尾，无更新动态模块。

## Desktop route header

640px起顶栏显示当前位置与导航路径，移除品牌／展会重复文案和常驻在线／缓存提示（缓存状态位于侧栏，离线时顶栏保留简短提示）。日程提供日期与视图上下文，地图提供图层名称；活动、艺术家与展商详情采用可点击的面包屑，上级节点承担返回所属目录的功能，不再提供独立返回按钮；目录面包屑保留最近一次筛选查询，首次直达活动详情时带上活动日期。艺术家路径可包含关联活动。长名称截断并保留完整title，右侧为搜索入口。PC内容区重复返回入口隐藏，手机继续使用品牌／菜单Header与正文返回链接。

## Detail workspace

活动、展商与艺术家共用详情面板，取代预览后跳转的流程。1024px起右侧占可用内容区的一半，左侧继续浏览并标记当前条目；较窄屏幕使用独立滚动的大模态浮层，手机高度94dvh，平板92dvh。关闭按钮和独立页入口固定在面板顶部。详情内的关联内容继续在面板中打开，可返回上一条并恢复阅读位置。

底层页面保持挂载：日期、筛选、时间轴滚动、展商搜索、我的观展当前页签以及地图缩放／平移保留。全屏日程中两侧各占窗口一半，进入／退出全屏可保持已打开的详情及阅读位置，Esc先关闭详情再退出全屏。收藏与已逛状态即时同步，详情本身仍有独立链接供分享与新标签页浏览。

### Compact desktop navigation

Desktop navigation uses an 88px rail with icons and short Chinese labels. The brand mark carries a compact 观展手册 caption; redundant edition and English sublabels are omitted. The active item uses the original dark background and light text (theme-aware), saved count remains as a small badge, and full names are available through accessible labels and hover titles. Detail panes split the space remaining after the rail equally. Tablet navigation stays 80px; phone navigation stays in the header menu.

### Detail reading structure

Activity, exhibitor and artist details share a narrow-first reading document with a compact sticky section navigation. The identity, primary actions and practical facts precede editorial content. Chapters use a clear heading/divider hierarchy; nested article headings are smaller, and long artist background in activity pages is disclosed on demand. Source attribution remains available in a collapsed footer. Exhibitors lead with booth location and map access; artists lead with performance dates before creative background. Container queries adapt the facts and product lists to the actual pane width, while wide standalone pages maintain a 720px reading measure. Keyboard focus follows section navigation and reduced-motion settings are respected.

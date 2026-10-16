# Design

## Context

个人观展工具。白天园区查地图，展区找品牌，夜间查看演出时间。全产品固定深色主题，原生控件与浏览器界面声明深色配色，不提供主题切换或系统主题跟随。

## Color

软触控制台视觉：灰绿面板、深色凹槽、鼠尾草绿主操作；活动为橙色，课程为青色。唯一颜色与材质来源为 `design/soft-touch-console/tokens.json`，构建时生成 `src/design-system/tokens.css`；语义别名、材质配方、控件与业务组件分层维护。

## Typography

中文系统无衬线字体；时间、编号和技术标识使用系统等宽字体。正文约13–15px，移动端标题约25–27px。标题与内容允许换行。

## Layout

手机顶部Header左侧为「交流方式观展手册」首页入口，右侧为全局菜单；搜索收纳于菜单顶部；菜单包含五个主要入口和参观须知，标明当前页面。桌面固定侧栏。列表行作为主要信息单元。单日全景时间向下、舞台并列、时间刻度与表头固定。展期总览统一时间刻度，五天按活动类型分栏。地图层级为场馆、一层、二层、功能分区。

## Components

统一44px按钮、日期选择器、书签、详情事实列表、地图目的地链接、来源链接、空状态。圆角分为标签4px、控件6px、面板8px。共用 Button 原生交互组件与 panel/elevated/inset/toolbar 四种材质配方；控制面采用浅浮雕和顶部高光，输入区采用凹槽阴影，阅读区保持平整。

## Interaction

活动、展商、地图与个人收藏相互关联。筛选和视图写入路由参数。地图为依据原图的示意定位，不提供精确室内导航。未知时长仅表示起点；时间块高度不代表未知活动的持续时间。

## Motion

动效按交互语义统一组织，参数集中在 `src/motion.css`，组件通过 `src/components/motion.ts` 复用存在状态与内容切换逻辑。整体采用无弹跳的减速曲线，不增加动效依赖。

| 层级 | 用途 | 规则 |
| --- | --- | --- |
| 反馈 | 按钮、收藏、筛选、导航选中 | 120ms颜色／边框过渡，操作按钮按下缩至97%，触控目标保持原尺寸 |
| 内容 | 路由、日程日期／筛选、个人页签、面板内关联详情、全屏切换 | 160ms单块淡入，不重新挂载时间轴或地图，不对搜索输入逐字播放 |
| 空间 | 桌面详情、移动详情、全局菜单 | 240ms进入／180ms退出，位移24px；分别从右、下、上边缘进入，遮罩同步淡入淡出 |
| 辅助 | 下拉菜单、资料折叠、地图定位卡、通知 | 6px轻量位移与短淡入；下拉依据展开方向进入，通知保持固定锚点 |

关闭浮层通过共享 `usePresence` 保留DOM、滚动锁和焦点生命周期，退出结束后卸载；退出阶段不可重复操作，重新打开取消待卸载任务。详情切换只淡入正文，面板和阅读位置管理继续复用。桌面分栏直接完成重排，不逐帧动画宽度；全景数据块、地图手势、长文高度和整屏列表不做逐项编排。首次加载立即呈现内容，没有滚动触发的隐藏或入场队列。

`prefers-reduced-motion` 下全部即时呈现；系统偏好在运行中变化时取消内容动画、立即完成浮层退出。支持CSS离散过渡的浏览器通过 `display`／`overlay` 与 `@starting-style` 保留下拉浮层的顶层退出动画，其他浏览器保持原生即时收起。

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

Desktop navigation uses an 88px rail with icons and short Chinese labels. The brand mark carries a compact 观展手册 caption; redundant edition and English sublabels are omitted. The active item uses a black background and light text within the fixed dark palette, saved count remains as a small badge, and full names are available through accessible labels and hover titles. Detail panes split the space remaining after the rail equally. Tablet navigation stays 80px; phone navigation stays in the header menu.

### Detail reading structure

Activity, exhibitor and artist details share a narrow-first reading document with a compact sticky section navigation. The identity, primary actions and practical facts precede editorial content. Chapters use a clear heading/divider hierarchy; nested article headings are smaller, and long artist background in activity pages is disclosed on demand. Source attribution remains available in a collapsed footer. Exhibitors lead with booth location and map access; artists lead with performance dates before creative background. Container queries adapt the facts and product lists to the actual pane width, while wide standalone pages maintain a 720px reading measure. Keyboard focus follows section navigation and reduced-motion settings are respected.

## Soft-touch implementation

全站按钮使用 `src/design-system/Button.tsx`；材质与控件样式在 `src/design-system/` 组合，现有布局放入 legacy 层避免高特异性覆盖材质系统。共享日程面板、筛选器、详情文档及地图组件直接组合材质类，禁止在页面中重复写高光和阴影。`npm run design:tokens` 生成 Token，build 自动执行。更多维护规则见 `src/design-system/README.md`。

## 拇指合成器

首页页尾提供「继续上拉，玩一点声音」入口，也可点击。到达底部后继续向上拖动达到阈值，提示「松手开始」，松手展开为首页内部的全屏原生 dialog；不足阈值回弹。首页保持挂载，退出恢复滚动位置。游戏是独立的视觉空间：近黑绿色 CRT 屏幕、绿色磷光点阵地形、细扫描线、小标题。按钮仍复用 Button，游戏内覆盖材质样式。静态关键状态参考位于 `design/thumb-synth-use-cases/index.html`。

声场用原生 WebGL 顶点／片元 Shader 绘制，限制像素比和刷新率；不支持 WebGL 或上下文丢失时改用 Canvas 2D。原生控件和文本覆盖其上，演奏区单独禁用触摸滚动，支持双指捕获、键盘、减少动态与底部安全区。音乐由 `@strudel/web` 1.3.0 驱动：`presets.ts` 使用 Strudel mini notation、slowcat 和分声部 Pattern 编排，`audio.ts` 将 Pattern 的 queryArc 事件按音频时钟送给 superdough。全部使用 Strudel 内置 sbd、white、sine、triangle、square、sawtooth 和 supersaw 合成音源；不加载采样包或整曲录音。进入保持静音，首次触摸或点开始才创建 AudioContext、初始化 worklet 并解锁声音。Strudel 延迟进入游戏后加载，工作线程代码随包内置，音乐没有额外音频资源下载。

四套音乐重写为 16 小节，候选顺序为重压（142 BPM Techno，F 小调，默认）、碎拍（132 BPM Electro Breakbeat，D 小调）、律动（124 BPM House，F 小调）、疾速（174 BPM Amen-inspired DnB，G 小调）。曲谱分别位于 `src/synth/scores/`，共享 `score-kit.ts` 的记谱辅助函数，每套独立鼓组、低音、和弦、主题、额外打击、点缀和过门。四小节为一个发展单元，9–12 小节引入对比，13–16 小节回归。House／Techno 的直拍、Breaks 的非对称切分和 DnB 的 Amen 式四小节碎拍与强弱军鼓清楚区分。

触摸映射由 `music-controls.ts` 管理，详见 `src/synth/REFERENCES.md`。第一指上下选择和声内旋律，左右塑造本套低音与演奏音色；第二指上下控制风格特征打击层和能量，左右控制延音、延迟与轻微声像。鼓组及 sub 保留稳定的核心。主题在用户演奏时保留 68% 音量。持久的 `live-mix.ts` orbit 总线让滑动直接作用于已发声声音；松手分别使用 420/320 ms 释放包络，新落指立刻接管。默认不再统一削弱鼓高频或过度关闭旋律滤波。

16 个进度点各代表一小节。录制窗口为 256 个十六分格，首次乐句松手后从自身开头回放，伴奏进度独立；后续替换与撤销在录制循环边界发生，风格在下一个小节切换。第一指离开后第二指继续调制伴奏。停止、退出、后台或系统中断均收音并挂起共享 AudioContext，再次进入不自动发声；静音保持视觉循环。只保存本次页面会话的当前句与前一句。`npm run test:synth` 验证和声、释放、窗口、各风格宏的边界与发音时长。

Strudel 使用 AGPL-3.0-or-later；保留包内版权和许可证，界面保留 Strudel 链接。正式分发集成产品须遵守该许可证的源码提供及兼容授权要求，详见 https://strudel.cc/technical-manual/project-start/ 。编曲与技术参考记录于 `src/synth/REFERENCES.md`。

音色区分：House 使用明亮加法琴键、呼应主题与弹性三角波低音，Techno 使用单声道酸性与受控失真，Breaks 使用 PWM 和数字位深质感，DnB 使用宽 Reese、切分短和弦与紧凑加法主题。用户触摸音色和每套延迟配置同步区分。所有原始 Strudel 事件在 `superdough` 边界通过 `strudel-controls.ts` 转换 Pattern 简写为底层规范键，避免滤波和 FM 参数被忽略。


音乐细化：House 强化两小节可辨识旋律、九和弦切分与八度 bass 呼应；Techno 保留 bass 基频并加入单声道低中频实体，190 Hz 宽峰及较浅的 75 ms 避让补足重量；DnB 通过短 gate、快速起音和密集切分形成速度感。DnB 触摸自动续奏默认八分，高能量加入切分起音，空间效果受限以保留瞬态和空隙。具体曲谱与参考见 `src/synth/REFERENCES.md`。


鼓组与效果细化：四套底鼓加入独立低中频敲击，高频鼓区分闭镲、开镲、clap 的重音和留白。Techno 转为 F 持续低音、冷金属与稀疏悬置；DnB 重排 Amen 式四小节鼓语法并加强 Reese/sub。上层声部使用原生 phaser、四小节滤波起伏及句末延迟发送，鼓和低频保持干净。`output.ts` 统一实时与离线输出保护，保留瞬态并校验峰值。

# 四套舞曲：编曲参考与交互设计

2026-10-16。旧三套旋律、鼓组及配器已移除。以下为成熟作品的节奏、音色与结构参考；本项目四套音符／鼓谱均为原创，未移植原录音、采样或第三方 prebake。

| 本项目 | 作品参考 | 借鉴重点 |
|---|---|---|
| 律动 · House · 124 BPM | [Daft Punk — Digital Love，官方视频](https://www.youtube.com/watch?v=FxzBvqY5PP0) / [Discovery](https://daftpunk.com/discovery/)；鼓组另参考 [Revolution 909](https://www.youtube.com/watch?v=Wtd6DvLoCsU) | 明确的重复主题与呼应、九和弦切分、八度低音；四踩与反拍开镲 |
| 重压 · Dark Industrial Techno · 142 BPM | [Jeff Mills — The Bells，Axis 官方发行](https://www.axisrecords.com/product/the-bells/) | F 持续低音、冷峻金属打击、稀疏悬置音与低音互锁；依靠重音、音色和层次推进 |
| 碎拍 · Electro Breakbeat · 132 BPM | [Bicep — Glue](https://www.youtube.com/watch?v=A7ZxRs45tTg) / [Atlas，Ninja Tune 艺人说明](https://ninjatune.net/release/bicep/atlas) / [The Chemical Brothers — Exit Planet Dust](https://www.thechemicalbrothers.com/music-videos/exit-planet-dust) | 切分底鼓与稳固军鼓、弱音回应、PWM 低音、数字短和弦与短句主题 |
| 疾速 · Amen-inspired Drum & Bass · 174 BPM | [Drum Hub — Amen Break 转录谱](https://static1.squarespace.com/static/58c82fceebbd1ac8334bc5db/t/615dd8a88c407c00546a4fdc/1633540264901/The%2BAmen%2BBreak.pdf) / [Stranjah — Amen 编排教程](https://www.transmissionsamples.com/tutorials/drum-and-bass-production/drum-and-bass-jungle-stranjah-part-2)；和声另参考 [High Contrast](https://hospitalrecords.bandcamp.com/track/if-we-ever) | 四小节 break 语法、双底鼓、军鼓移位、弱音回应和滚奏；厚 Reese/sub 配短旋律 |

## 结构和鼓组

每套 16 小节：1–4 呈示主题、5–8 改变低音与鼓组回应、9–12 加入对比配器、13–16 回归并用填充收尾。开头就提供鼓、低音和识别性主题。16 个进度点各代表一小节，录制窗口同步扩为 256 个十六分格。

- House：紧凑 sbd kick + click；拍手噪声的三个瞬态压在约 20 ms 内，加噪声尾和短躯干；摇摆镲和康加。
- Techno：短硬 kick + click；明确的开闭镲、金属 FM、厚实单声道低音 hook、sub 与短脉冲主题。
- Breaks：非对称双小节底鼓，独立 body/noise 军鼓，弱军鼓和通鼓回应，干脆金属镲。
- DnB：Amen 式四小节底鼓／军鼓语法，noise/body 军鼓与两档弱音，第三小节军鼓移位、第四小节短滚奏，选择性 clap 与开镲；厚 Reese、独立低中频层与根音 sub。

## 双指宏

第一指上下选择跟随和声的五声音阶；左右控制本套的特征音色。第二指相对落点上下改变额外节奏层，横向改变上层延迟、延音与轻微声像。鼓、sub 从不进入长延迟，主题在触摸时仍保留 68% 音量作为音乐识别点。

| 风格 | 第一指左右 | 第二指上下 | 第二指左右 |
|---|---|---|---|
| House | 低音滤波、少量饱和、加法琴键的谐波亮度 | 康加／金属打击增益、和弦短切、自动续奏密度 | 和弦与主题的短回声、延音 |
| Techno | 低音谐波、酸性 lead 的滤波包络 | 额外打击增益、滤波共振／包络、量化的续奏密度 | 较短、受控的节拍延迟 |
| Breakbeat | PWM 低音颗粒、滤波包络 | 弱音回应、金属镲和过门层 | Dub 延迟与点缀声像 |
| DnB | Reese 失谐与滤波、短促加法 lead 的谐波 | 摇铃／ride／填充层及续奏密度 | 受限的和弦尾音、整拍短回声与上层空间 |

松开第一指使用 420 ms、松开第二指使用 320 ms 的释放包络，声音与光点同步衔接。重新按下立刻接管。参数在已有音符上通过持久的 orbit 滤波／增益／延迟节点生效，新音符额外使用风格专属事件参数。

## 这次重写修正的声音问题

- 取消全鼓组的统一低通及粗糙的全局重音规则，每套鼓谱负责自己的强弱；避免压掉军鼓、镲片瞬态。
- 默认旋律总线保持较开放的滤波，保留各音色自身的滤波包络，避免上一版多层低通叠加让音色都发闷。
- `eventDuration` 使短记谱格里的军鼓、拨弦能完成衰减；也支持显式 `gate` 秒数。DnB 的 Reese/sub、和弦与旋律均显式指定短 gate，避免快速节奏被记谱槽位或长尾覆盖。
- House 的 kick 对低音和和弦使用 110 ms 避让；Techno 现改为 75 ms、保留 68% 电平，避免把 bass 音体抽空；Breaks／DnB 使用约 45–65 ms 的浅避让。
- 自制鼓显式设置 `pattack:0, psustain:0, panchor:0`，避免 Strudel 默认起音把下降音高包络变成缓慢升音。

所有声音来自 Strudel 内置 sbd、噪声、基本波形、FM 和 Supersaw；无 samples()、外部采样或额外音频文件。曲谱按声部配置增益，统一输出经过峰值保护。

技术依据：[Strudel Synths](https://strudel.cc/learn/synths/)、[Effects](https://strudel.cc/learn/effects/)，并核对 @strudel/web 1.3.0 安装包的 synth / helpers / superdough 实现。离线渲染验证 16 小节结构及数值安全，浏览器验证双指、松手、风格切换与生命周期；听感仍应以实际手机和耳机试听判断。

## 音色区分修订

四套使用不同音源／包络／效果组合，避免继续共用短促 FM 铃音：House 为三角波弹性低音、加法琴键和清晰的呼应主题，分层噪声干拍手／白噪声镲；Techno 为单声道酸性锯齿、低音脉冲主题、受控失真与金属打击；Breaks 为 PWM 脉冲低音／主题、7–10 bit 数字短和弦及军鼓；DnB 独占宽立体声 Reese，和弦使用快速起音的 Supersaw 短击；主题为带少量颤音、近似正弦的紧凑加法短句。

触摸 lead 同样分为加法琴键、酸性锯齿、数字 pulse、短促加法音；延迟分别为 .5 / .25 / .75 / 1 拍，反馈与尾音滤波独立。Pulse 内部没有普通波形的 .3 增益衰减，因此单独降低其电平。DnB 的实时触摸发音也经 `eventDuration` 读取 gate，保证基础与实时发音遵守同样的短音衔接。

本次修复了原始事件调用的参数转换错误：Strudel Pattern 的 `.lpf`、`.lpq`、`.hpf`、`.fm` 方法会自动转换为底层 `cutoff`、`resonance`、`hcutoff`、`fmi`，而 `withValue` 写入对象会绕过该步骤。此前部分源滤波／FM 设置被底层忽略。现在所有音频触发统一经过纯函数 `strudel-controls.ts:engineControls`，并测试规范名优先、不修改原对象及自定义合成参数保留。`partials`、PWM、vib/vibmod 等使用底层实际名称。修复后重新导出并验证基础／触摸两版。


## 旋律、低频与速度感修订

- House：保留 124 BPM，主旋律回到 C5 一带，以两小节呼应形成可辨识的主题；Fm9 → Dbmaj9 → Abmaj9 → Eb9 的无根音琴键切分和弦，与含根音、八度、三音和七音的 bass 互相回应。按重复主题／变化和声的思路参考《Digital Love》，重新谱写音符。
- Techno：保留 142 BPM 与硬鼓。源端 bass 高通从 95 Hz 降到 44 Hz，保留 F2 的 87 Hz 基频；降低尖锐共振，延长至 165–180 ms 的音体。锯齿、加法低中频和跟随 hook 的单声道 sub 分工，190 Hz 宽峰 EQ 提供厚度；双指仍能打开谐波，但底层重量保持稳定。
- DnB：保留 174 BPM，主旋律改用八分／十六分切分短句，和弦由整小节慢起音改为有空隙的节奏短击，Reese 与根音 sub 配合鼓组留白推进。触摸发音起音 5 ms、gate 110 ms，基础自动续奏每小节八次；高能量增加两个切分起音。延迟反馈降至 .20，基础宏最大发送量 .252，句末自动发送另加最多 .11，空间拉满也保留音符间隙。
- Breakbeat：该轮保留曲谱；本次进一步强化底鼓、军鼓与高频节奏，见下节。

本轮重新导出三个风格的完整 16 小节及双指版本，检查削波、电平、音符起音分布与实际浏览器交互。无新增采样或音频资源下载。


## 鼓组、黑暗音色与效果器修订

- 四套底鼓加入短促的低中频敲击／瞬态，与低频主体分工；鼓总线相对旋律前置，kick 1.22、drums 1.12、chords .82、motif .86。输出保护改为 -2.5 dB 阈值、3 ms 起效、45 ms 释放，保留鼓起音；实时与离线试听共用 `output.ts` 配置。
- House 的 clap 扩展实体与瞬态频段，开闭镲分开，白噪声高频取代被高通过度削弱的粉红噪声。Breaks 的 snare/clap、数字镲也重新分配重音与留白，避免只堆叠同一节奏。
- Techno 全 16 小节保持 F 低音中心；少量 Gb 悬置、非整数 FM 金属、干短脉冲主题形成冷峻色彩，触摸仍使用 F 小调五声。9–12 小节高频鼓更密，回归段收束。
- DnB 依 Drum Hub 的演奏转录与 Stranjah 教程，借鉴 Amen 的双底鼓、弱军鼓、第三小节末军鼓后移、第四小节 cymbal/32 分滚奏；重新编排 16 小节，不加载原始 break 录音。Reese 高通 62 Hz、增益 .58、gate 170 ms，另叠加 .25 的低中频谐波层；sub 增益 .70、gate 210 ms，稳定根音。
- 和弦与高层点缀使用 Strudel 原生 phaser；不同风格设置独立的速率、中心与扫描范围，第二指横向改变深度。每四小节的上层滤波缓慢变化，句末短暂提高节拍延迟发送；Breaks 回声最明显，Techno 使用较暗的短回声，DnB 控制反馈和尾音。核心 kick、drums、bass、sub 不进入这些空间发送，低频保持稳定。
- 自动效果在触摸、录制回放和空闲播放中均按音频时钟推进。单指 420 ms／双指 320 ms 的释放沿用；停止后所有节点和尾音收音。

效果器参数依据 [Strudel Effects](https://strudel.cc/learn/effects/) 并核对当前安装包规范名 `phaserrate` / `phaserdepth` / `phasercenter` / `phasersweep`。不添加采样包或第三方音频资源。

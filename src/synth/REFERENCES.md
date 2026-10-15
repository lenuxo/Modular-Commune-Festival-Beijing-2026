# Strudel 编曲参考与实现取舍

2026-10-15 调研。以下为公开作品与作者资料；本项目重新创作旋律、节奏与八小节结构，未复制整首作品、采样或第三方 prebake。

- [Switch Angel — Coding Trance](https://soundcloud.com/switch_angel/coding-trance-official-1) 与 [现场编写视频](https://www.youtube.com/watch?v=GWXCCBsOMSg)。重点研究其[作者公开代码](https://github.com/switchangel/strudel-scripts/blob/main/prebake.strudel)中的 Supersaw、trance gate、酸性包络与噪声镲思路。采用内置 Supersaw 的低音／和弦／主题分层，固定节奏门与滤波包络；不引入其扩展函数和采样依赖。
- [froos：和声与琶音示例及作品入口](https://tidalcycles.org/blog/tidal_profile_froos/)。借鉴紧凑和弦排列、扩展和弦色彩、旋律重复时的小幅变奏；Garage 使用 Dm9、Gm9、Bbmaj9 与 C9 的根音外和弦排列。
- [Pastagang — farfalle funk，参与者的混音复盘](https://midirus.com/audio/pgFarfalleFunk)。参考鼓对合成器的侧链避让和低频分工；在浏览器内实现独立 pump 增益包络，不依赖其 DAW 后期链。
- [Strudel 原生合成音源](https://strudel.cc/learn/synths/)、[效果及连续变化限制](https://strudel.cc/learn/effects/)、[Recipes](https://strudel.cc/recipes/recipes/)。当前锁定 @strudel/web 1.3.0，并核对安装包中 getOrbit / reset 的实现。

## 三组原创八小节

- 弹跳，132 BPM：2-step 鼓、摇摆镲、FM 低音、根音外短和弦，四小节问答动机在后半段加入高音回应。
- 脉冲，136 BPM：四拍合成底鼓、16 分酸性音序、金属 FM 打击与稀疏动机；第五小节转 Db，第八小节停顿回环。
- 升空，138 BPM：滚动低音、五声部 Supersaw 主题、切分和弦与高音琶音；相同主题随 Am / F / C / G 调整，尾小节留白。

## 资源和交互

鼓由 sbd 的三角波／噪声和 white + triangle 分层合成，镲用滤波白噪声，金属打击用 FM。无 samples() / loadBuffer()，无音频文件、外部采样站点或运行时外部音源请求。Strudel 的所谓默认采样银行也需要音频下载，因此这里仅采用内置合成器。

Strudel Pattern 参数大多在音符 onset 采样，不能仅更新对象就实现已发声声音的实时调制。LiveMix 将每个 orbit 输出接入持久的 BiquadFilter、gain、tempo delay；PointerMove 直接更新其 AudioParams。第一指换音实时发声并保留滞回与 35 ms 重触发间隔；节奏续奏依然在音频时钟上。第二指上下连续控制截止频率与打击层，左右连续控制回声发送，反馈 .28；旋律固定在当前和声的五声音阶内。底鼓和次低音基础保留，母线峰值保护。

滤波、音量、回声的控制值有界，但“好听”仍是主观判断，应使用实际手机扬声器／耳机试听。离线渲染与浏览器检查能验证结构、响应路径与数值安全，不能替代听感判断。

# 图片资源放置清单

所有图片都放在项目根目录的 `public/images` 下面。代码已经统一引用本地路径，例如 `/images/spots/maple-bridge.jpg`。文件名必须和下面完全一致，建议统一使用 `.jpg`。

如果暂时没放图，页面不会崩，会显示渐变占位图；但最终展示效果需要按下面补齐图片。

## 地图类图片

目录：`public/images/maps`

| 文件名 | 用途 | 建议找什么图 |
| --- | --- | --- |
| `quick-visit-map.jpg` | 轻游路线卡片和详情地图 | 简洁的枫桥到寒山寺短路线图 |
| `poetry-route-map.jpg` | 诗意路线卡片和详情地图 | 带诗碑、江枫、寒山寺节点的文化路线图 |
| `grand-canal-route-map.jpg` | 运河路线卡片和详情地图 | 大运河、码头、铁铃关、旧市场相关路线图 |

建议尺寸：横图或方图都可以，至少 `1200px` 宽。

## 景点图片

目录：`public/images/spots`

| 文件名 | 用途 | 建议找什么图 |
| --- | --- | --- |
| `maple-bridge.jpg` | 首页第一个主图、枫桥详情主图 | 枫桥全景、夜景、桥与水面同框 |
| `maple-bridge-old.jpg` | 枫桥 old 对比 | 老照片、旧版插画、历史照片、黑白图 |
| `maple-bridge-now.jpg` | 枫桥 now 对比 | 现在的枫桥实景 |
| `hanshan-temple.jpg` | 寒山寺主图 | 寒山寺入口、钟楼、寺院建筑 |
| `hanshan-temple-old.jpg` | 寒山寺 old 对比 | 寒山寺老照片、历史影像、旧明信片风格图 |
| `hanshan-temple-now.jpg` | 寒山寺 now 对比 | 现在的寒山寺实景 |
| `tieling-pass.jpg` | 铁铃关主图 | 铁铃关、城门、关隘、桥关结合的照片 |
| `tieling-pass-old.jpg` | 铁铃关 old 对比 | 铁铃关旧照或历史风格图 |
| `tieling-pass-now.jpg` | 铁铃关 now 对比 | 现在的铁铃关实景 |
| `grand-canal.jpg` | 大运河主图 | 苏州大运河水面、船、岸边、桥 |
| `grand-canal-old.jpg` | 大运河 old 对比 | 运河老照片、旧码头、老船运场景 |
| `grand-canal-now.jpg` | 大运河 now 对比 | 现在的大运河步道或水岸实景 |

建议尺寸：主图至少 `1200x800`；old/now 对比图建议比例接近，方便页面并排显示。

## 故事互动图片

目录：`public/images/stories`

| 文件名 | 用途 | 建议找什么图 |
| --- | --- | --- |
| `hanshan-shide.jpg` | 印章页“寒山与拾得”故事图 | 寒山拾得画像、和合二仙、寺庙人物壁画或国风插画 |

## 个人与总结图片

目录：`public/images/profile`

| 文件名 | 用途 | 建议找什么图 |
| --- | --- | --- |
| `avatar.jpg` | 个人页头像 | 可以放默认游客头像、国风人物头像、团队 logo 或用户头像 |

目录：`public/images/summary`

| 文件名 | 用途 | 建议找什么图 |
| --- | --- | --- |
| `share-card-bg.jpg` | 访问总结分享卡背景 | 枫桥夜景、江南水巷、运河水面、宣纸/水墨风背景 |

## 注意事项

- 不要把图片放到 `src` 里面，本项目现在从 `public/images` 读取。
- 图片文件名不要出现中文、空格或特殊符号。
- 如果你找到的是 `.png`，要么改成同名 `.jpg`，要么告诉我，我可以帮你把代码引用改成 `.png`。
- 图片太大时建议压缩到单张 `300KB - 800KB` 左右，手机端加载会更快。

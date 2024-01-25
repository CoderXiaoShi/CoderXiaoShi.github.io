> 本片内容转载自得到

【万能公式】
⭐「主体」+「媒介」+「环境」+「构图」+「灯光」+「风格」+「氛围」+「情绪」
- 主体：人、动物、人物、地点、物体等。person, animal, character, location, object,
媒介：照片、绘画、插图、雕塑、涂鸦、挂毯等。photo, painting, illustration, sculpture, doodle, tapestry
- 环境：室内、室外、月球上、纳尼亚、水下、翡翠城等。indoors, outdoors, on the moon, in Narnia, underwater, the Emerald City
构图：顶视、人像、爆头、特写、鸟瞰图等。Top view，Portrait, headshot, closeup, birds-eye view,
- 灯光：柔光、环境、阴天、霓虹灯、工作室灯等。soft light, ambient, overcast, neon, studio lights
- 氛围：充满活力、柔和、明亮、单色、彩色、黑白、柔和等。vibrant, muted, bright, monochromatic, colorful, black and white, pastel
- 情绪：稳重、平静、喧闹、精力充沛等。Sedate, calm, raucous, energetic
- 风格：东方山水画、浮世绘、日本漫画风格、皮克斯、蒸汽朋克、新海诚、宫崎骏风格。Tradition Chinese Ink Painting，Japanese Ukiyo-e，Japanese comics/manga，Pixar，Steampunk，Makoto Shinkai，Miyazaki Hayao style

【常用参数】
- upbeta 使用测试性算法，可能生成质量更高或者风格更奇持的图
- test 使用测试性算法，和–upbeta比较类似，可生成质量更高或者风格更奇特的图，应用–test后，生成的图片会由四张变为一张
- hd 生成更高清的图，但是可能会减少图片中的细节，适合用于风景画、抽象画
- ar n.m 控制图片尺寸，n是长，m是宽，例如–ar 16:9， 可以输出长宽比为16:9的图片。注意冒号必须使用英文的冒号，中文冒号会不生效，ar后面必须空一 格再输入，否则可能不生效。
- seed参如果你想基于自己或别人的画作生成类似图像，又想调整下prompt，可以在prompt加入画作的Seed，格式是–seed 1949
- no去掉参数，–no 加具体物品，出图将不包含该物品，比如说–no people,新生成图片中将不包含人。
- creative创造(性)的，创作的;有创造力的，有想象力的
- iw 数字:设置图片与参考图和描述文字的相似程度。右键一张单图， 点击复制链接,粘贴到promt框，再输入描述性文字，比方说末尾加–iw0.5,数字越大，参考程度越高，系统默认为0.25, 最大值为5。
- q 生图时间，系统默认为1,数字越大，生图时间越长，质量越高。
- 只能输入–q 0.25 –q 0.5 –q 1 –q 2 –q5 这五种数字。系统默认值为1,如果选用默认值,就无需在设置此项参数
- Chaos 生成四张风格迥异的图，数值范围在0-100,数字越大，风格越不一致。
- stop 图片停在一个具体百分比阶段，如输入–stop90, 则会在图片加载90%时停止升级，生成最终效果。
- s 生成个性化，艺术性，更有创造里、想象力图片。数字范围值: 625-60000。系统默认值2500。数字越大，越有创造力，如果输入–S 60000， 生成的图与你输入的描述性文字可以说毫无关系。

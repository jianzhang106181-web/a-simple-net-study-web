/**
 * 课程数据源（纯前端演示数据）
 *
 * 所有课程详情类页面（course-detail.html / learn.html / profile.html）共用，
 * 通过 URL 参数 ?id=课程id 命中同一条数据，实现"单模板 + url 参数"渲染。
 *
 * 字段说明：
 *  - free: true 表示免费课（购买按钮显示"免费学习"）
 *  - chapters: 章节数组，每章含 lessons 课时列表（用于 Accordion 渲染）
 */
(function () {
    "use strict";

    var COURSES = [
        {
            id: "web-dev-basic",
            title: "零基础网页设计与开发入门课程",
            cover: "static/picture/course-1.jpg",
            price: 149.00,
            free: false,
            rating: 5,
            ratingCount: 123,
            students: 30,
            duration: "1.49 小时",
            level: "入门",
            category: "网页设计",
            instructor: {
                name: "诺亚",
                title: "宇宙第一道光（石头！）",
                avatar: "static/picture/teacher-noya.png",
                intro: "十年一线互联网公司前端开发经验，主导过多个大型电商与中后台项目，擅长把复杂的技术概念讲得通俗易懂。已累计带教上千名零基础学员入行前端开发。"
            },
            intro: [
                "本课程专为零基础学员设计，从网页是如何呈现在浏览器中的讲起，循序渐进带你掌握 HTML、CSS 与 JavaScript 三大前端基石，最终独立完成一个可以上线展示的个人网页作品。",
                "课程采用案例驱动教学，每一章都配有随堂练习与课后作业，边学边练，告别只看不动的低效学习模式。"
            ],
            highlights: [
                "HTML / CSS / JavaScript 系统讲解",
                "从 0 到 1 完成个人网页作品",
                "随堂练习 + 课后作业巩固",
                "讲师在线答疑与作业点评"
            ],
            chapters: [
                {
                    title: "第 1 章 认识网页与开发环境",
                    duration: "25 分钟",
                    lessons: [
                        "1-1 什么是网页：从输入 URL 到看到页面",
                        "1-2 安装与配置开发工具 VS Code",
                        "1-3 编写你的第一个 HTML 页面",
                        "1-4 学会使用浏览器开发者工具"
                    ]
                },
                {
                    title: "第 2 章 HTML 结构与 CSS 样式",
                    duration: "32 分钟",
                    lessons: [
                        "2-1 常用 HTML 标签与语义化结构",
                        "2-2 CSS 选择器与盒模型",
                        "2-3 Flex 弹性布局实战",
                        "2-4 案例：还原一个静态首页"
                    ]
                },
                {
                    title: "第 3 章 JavaScript 交互与项目实战",
                    duration: "32 分钟",
                    lessons: [
                        "3-1 变量、函数与事件入门",
                        "3-2 操作页面元素：DOM 基础",
                        "3-3 案例：为首页加上轮播与菜单交互",
                        "3-4 课程总结与下一步学习路线"
                    ]
                }
            ]
        },
        {
            id: "ui-design",
            title: "平面设计实战：从海报到品牌视觉",
            cover: "static/picture/course-2.jpg",
            price: 199.00,
            free: false,
            rating: 5,
            ratingCount: 98,
            students: 45,
            duration: "2.5 小时",
            level: "进阶",
            category: "平面设计",
            instructor: {
                name: "迪迦",
                title: "光的最大化（石头！！！）",
                avatar: "static/picture/teacher-tiga.png",
                intro: "服务过数十个品牌的视觉设计顾问，作品多次获得设计类奖项。擅长从商业目标出发讲解设计方法论，而不只是软件操作。"
            },
            intro: [
                "本课程以真实商业项目为蓝本，带你完成从活动海报、社交媒体配图到整套品牌视觉的完整设计流程，掌握排版、配色与字体搭配的核心方法论。",
                "无需设计基础，只要会基本的电脑操作，就能跟着讲师一步步做出拿得出手的设计作品。"
            ],
            highlights: [
                "排版 / 配色 / 字体三大核心能力",
                "真实商业案例全流程复盘",
                "赠送课程配套源文件与素材包",
                "结业作品可获得讲师点评"
            ],
            chapters: [
                {
                    title: "第 1 章 设计基础与工具准备",
                    duration: "30 分钟",
                    lessons: [
                        "1-1 好设计的三个判断标准",
                        "1-2 常用设计工具介绍与选择",
                        "1-3 收集灵感：建立自己的素材库"
                    ]
                },
                {
                    title: "第 2 章 版式、配色与字体",
                    duration: "45 分钟",
                    lessons: [
                        "2-1 排版四原则：对齐、重复、对比、亲密",
                        "2-2 配色方法与实用配色工具",
                        "2-3 字体选择与中英文搭配技巧"
                    ]
                },
                {
                    title: "第 3 章 实战：一张活动海报的诞生",
                    duration: "45 分钟",
                    lessons: [
                        "3-1 需求分析与草图方案",
                        "3-2 电子稿制作与细节打磨",
                        "3-3 输出规范与多平台适配"
                    ]
                }
            ]
        },
        {
            id: "video-edit",
            title: "视频剪辑速成：从素材到成片",
            cover: "static/picture/course-3.jpg",
            price: 0,
            free: true,
            rating: 5,
            ratingCount: 210,
            students: 128,
            duration: "1.5 小时",
            level: "入门",
            category: "视频剪辑",
            instructor: {
                name: "佐菲",
                title: "为什么折断奥特钥匙！",
                avatar: "static/picture/teacher-zofi.png",
                intro: "全网粉丝百万的短视频创作者，多条作品播放量破千万。这门免费课是他最受欢迎的入门内容，帮你用最短时间剪出第一条完整视频。"
            },
            intro: [
                "这是平台为大家准备的免费公开课。课程以一条短视频的完整制作为主线，涵盖素材整理、粗剪、节奏卡点、调色字幕到导出发布的全流程。",
                "学完即可独立完成自己的第一条成片，适合想尝试自媒体的新人入门。"
            ],
            highlights: [
                "免费公开课，注册即可学习",
                "完整成片流程一次讲透",
                "附赠常用转场与字幕模板",
                "适合自媒体新人入门"
            ],
            chapters: [
                {
                    title: "第 1 章 剪辑前的准备",
                    duration: "20 分钟",
                    lessons: [
                        "1-1 认识剪辑软件界面",
                        "1-2 素材整理与工程文件管理"
                    ]
                },
                {
                    title: "第 2 章 剪辑核心技巧",
                    duration: "40 分钟",
                    lessons: [
                        "2-1 粗剪：先讲故事，再谈节奏",
                        "2-2 卡点与转场的正确用法",
                        "2-3 字幕、音乐与音效搭配"
                    ]
                },
                {
                    title: "第 3 章 成片与发布",
                    duration: "30 分钟",
                    lessons: [
                        "3-1 调色让画面更高级",
                        "3-2 导出参数与多平台发布建议"
                    ]
                }
            ]
        },
        {
            id: "net-marketing",
            title: "网络营销入门与实战",
            cover: "static/picture/cat-4.jpg",
            price: 129.00,
            free: false,
            rating: 4,
            ratingCount: 86,
            students: 62,
            duration: "2 小时",
            level: "入门",
            category: "网络营销",
            instructor: {
                name: "诺亚",
                title: "宇宙第一道光（石头！）",
                avatar: "static/picture/teacher-noya.png",
                intro: "先后负责多家公司线上增长业务，熟悉搜索、信息流与社交媒体投放，擅长用数据驱动的方式拆解营销问题。"
            },
            intro: [
                "本课程系统梳理网络营销的常见渠道与方法，包括内容营销、社群运营、投放广告与数据分析，帮你建立完整的营销知识框架。",
                "每章结尾配有可落地的实操清单，学完就能在自己或公司的项目上直接套用。"
            ],
            highlights: [
                "主流营销渠道全景梳理",
                "数据指标与投放入门",
                "每章附可落地实操清单",
                "适合运营与市场新人"
            ],
            chapters: [
                {
                    title: "第 1 章 营销思维与用户洞察",
                    duration: "30 分钟",
                    lessons: [
                        "1-1 什么是有效的网络营销",
                        "1-2 找到你的目标用户与场景"
                    ]
                },
                {
                    title: "第 2 章 内容与渠道运营",
                    duration: "50 分钟",
                    lessons: [
                        "2-1 内容营销：选题与爆款结构",
                        "2-2 社群运营的日常动作",
                        "2-3 广告投放入门与预算控制"
                    ]
                },
                {
                    title: "第 3 章 数据分析与复盘",
                    duration: "40 分钟",
                    lessons: [
                        "3-1 必须看懂的核心数据指标",
                        "3-2 一次完整活动复盘怎么做"
                    ]
                }
            ]
        },
        {
            id: "python-basic",
            title: "Python 编程零基础入门",
            cover: "static/picture/cat-1.jpg",
            price: 0,
            free: true,
            rating: 5,
            ratingCount: 156,
            students: 96,
            duration: "1.8 小时",
            level: "入门",
            category: "编程开发",
            instructor: {
                name: "迪迦",
                title: "光的最大化（石头！！！）",
                avatar: "static/picture/teacher-tiga.png",
                intro: "八年 Python 开发经验，做过爬虫、数据分析与 Web 后端。相信编程是最好的思维训练，致力于让零基础学员也能体会到写代码的乐趣。"
            },
            intro: [
                "免费入门公开课：从安装 Python 到写出第一个自动化小脚本，用生活化的例子讲解变量、循环、函数等编程核心概念。",
                "课程不需要任何编程背景，是后续学习数据分析、人工智能等方向的第一块敲门砖。"
            ],
            highlights: [
                "免费公开课，注册即可学习",
                "生活化案例，零基础友好",
                "附赠课后练习与参考答案",
                "衔接数据分析进阶方向"
            ],
            chapters: [
                {
                    title: "第 1 章 初识 Python",
                    duration: "25 分钟",
                    lessons: [
                        "1-1 安装 Python 与运行第一行代码",
                        "1-2 变量与基础数据类型"
                    ]
                },
                {
                    title: "第 2 章 流程控制与函数",
                    duration: "40 分钟",
                    lessons: [
                        "2-1 条件判断：让程序学会选择",
                        "2-2 循环：重复的事情交给代码",
                        "2-3 函数：把功能打包复用"
                    ]
                },
                {
                    title: "第 3 章 实战小项目",
                    duration: "30 分钟",
                    lessons: [
                        "3-1 案例：批量重命名文件脚本",
                        "3-2 下一步学习路线建议"
                    ]
                }
            ]
        },
        {
            id: "career-up",
            title: "职场竞争力提升训练营",
            cover: "static/picture/cat-3.jpg",
            price: 249.00,
            free: false,
            rating: 5,
            ratingCount: 77,
            students: 41,
            duration: "3 小时",
            level: "通用",
            category: "职业发展",
            instructor: {
                name: "佐菲",
                title: "为什么折断奥特钥匙！",
                avatar: "static/picture/teacher-zofi.png",
                intro: "十余年招聘与人才发展经验，面试过上千名候选人。从面试官视角拆解求职与晋升的关键动作，学员平均 2 个月内拿到心仪 offer。"
            },
            intro: [
                "本课程从简历打磨、面试表达、汇报沟通到向上管理，系统提升你的职场软实力，每个模块都配有可直接套用的模板与话术。",
                "适合正在求职、准备跳槽或希望在新一年获得晋升机会的职场人。"
            ],
            highlights: [
                "简历 / 面试 / 汇报全套模板",
                "面试官视角拆解常见问题",
                "向上管理与沟通话术",
                "结营产出：一份定制求职计划"
            ],
            chapters: [
                {
                    title: "第 1 章 简历与求职准备",
                    duration: "40 分钟",
                    lessons: [
                        "1-1 面试官如何 30 秒筛一份简历",
                        "1-2 用 STAR 法则重写你的经历"
                    ]
                },
                {
                    title: "第 2 章 面试与表达",
                    duration: "50 分钟",
                    lessons: [
                        "2-1 高频面试题的应答框架",
                        "2-2 薪资谈判的时机与话术"
                    ]
                },
                {
                    title: "第 3 章 入职后的持续成长",
                    duration: "45 分钟",
                    lessons: [
                        "3-1 让汇报为你的价值加分",
                        "3-2 与上级建立信任的日常动作"
                    ]
                }
            ]
        }
    ];

    function getById(id) {
        id = String(id || "");
        for (var i = 0; i < COURSES.length; i++) {
            if (COURSES[i].id === id) return COURSES[i];
        }
        return null;
    }

    /** 统计课程总课时数 */
    function lessonCount(course) {
        var n = 0;
        (course.chapters || []).forEach(function (ch) {
            n += (ch.lessons || []).length;
        });
        return n;
    }

    window.CourseData = {
        list: COURSES,
        getById: getById,
        lessonCount: lessonCount
    };

    /* =====================================================
     * 数据假接口：data/courses.json 优先（fetch），失败回退内置数据
     *  - 统一数据源：JSON 加载成功后原位替换 COURSES，getById/list 自动生效
     *  - 缓存：ready 为单例 Promise，一次加载后不再重复请求
     *  - file:// 下 fetch 会因 CORS 报错 → 自动回退内置数据，双击打开也能跑
     * ===================================================== */
    var settled = false;
    CourseData.ready = new Promise(function (resolve) {
        function finish() { if (!settled) { settled = true; resolve(); } }
        try {
            fetch("data/courses.json")
                .then(function (res) { return res.ok ? res.json() : null; })
                .then(function (arr) {
                    if (settled) return; // 超时兜底已触发，放弃迟到结果
                    if (Array.isArray(arr) && arr.length) {
                        COURSES.length = 0;
                        arr.forEach(function (c) { COURSES.push(c); });
                    }
                    finish();
                })
                .catch(function () { finish(); }); // file:// / 网络失败 → 内置数据兜底
            setTimeout(finish, 2000); // 超时兜底，保证渲染不被卡住
        } catch (e) { finish(); }
    });
})();

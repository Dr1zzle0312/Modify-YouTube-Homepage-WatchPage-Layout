// ==UserScript==
// @name Modify YouTube Homepage Layout + Modify YouTube WatchPage Layout
// @name:zh-CN YouTube首页视频布局优化 + 播放页布局优化
// @namespace http://tampermonkey.net/
// @version 1.2
// @description WatchPage Center Comments & Enlarge Font Size, Reduce width of Suggested Videos. Modify YouTube Homepage Layout, Show more video cards on Homepage
// @description:zh-CN 首页视频卡片自适应缩放最多5列 视频页评论居中放大，缩小右侧推荐视频宽度。
// @author You
// @match https://www.youtube.com/*
// @grant GM_addStyle
// @run-at document-start
// @license MIT
// ==/UserScript==
(function() {
    'use strict';
    // ========== 【模块A 视频播放页样式：原版原样，只在/watch加载】 ==========
    const watchCss = `
        /* ===== 评论区整体左侧留白 + 放大文字 ===== */
        ytd-comments#comments, #comments {
            padding-left: 200px !important;
            padding-right: 40px !important;
            box-sizing: border-box !important;
        }
        /* 放大评论文字 */
        #content-text,
        ytd-comment-renderer #content-text,
        ytd-comment-view-model #content-text,
        yt-formatted-string#content-text {
            font-size: 18px !important;
            line-height: 1.5 !important;
        }
        /* 作者名字稍微放大 */
        #author-text,
        ytd-comment-renderer #author-text {
            font-size: 15px !important;
        }
        /* 回复评论也放大一点 */
        #replies #content-text {
            font-size: 15.5px !important;
        }
        /* ===== 视频页右侧推荐视频缩小 ===== */
        ytd-watch-next-secondary-results-renderer {
            --ytd-watch-flexy-sidebar-width: 340px !important;
        }
        #secondary {
            max-width: 340px !important;
            min-width: 300px !important;
        }
        ytd-compact-video-renderer ytd-thumbnail {
            max-width: 150px !important;
        }
        ytd-compact-video-renderer #video-title {
            font-size: 13px !important;
            line-height: 1.3 !important;
        }
        ytd-compact-video-renderer #metadata-line {
            font-size: 12px !important;
        }
    `;

    // ========== 【模块B 首页样式：仅首页 "/" 加载，自适应列数，大屏5卡】 ==========
    const homeCss = `
        @media (min-width: 1600px) {
            ytd-rich-grid-renderer {
                --ytd-rich-grid-items-per-row: 5 !important;
            }
        }
        @media (min-width: 1300px) and (max-width:1599px) {
            ytd-rich-grid-renderer {
                --ytd-rich-grid-items-per-row: 4 !important;
            }
        }
        @media (min-width: 1000px) and (max-width:1299px) {
            ytd-rich-grid-renderer {
                --ytd-rich-grid-items-per-row: 3 !important;
            }
        }
        @media (min-width: 700px) and (max-width:999px) {
            ytd-rich-grid-renderer {
                --ytd-rich-grid-items-per-row: 2 !important;
            }
        }
        @media (max-width:699px) {
            ytd-rich-grid-renderer {
                --ytd-rich-grid-items-per-row: 1 !important;
            }
        }
        ytd-rich-grid-renderer #contents ytd-rich-item-renderer {
            min-width: 0 !important;
        }
    `;

    let watchStyleEl = null;
    let homeStyleEl = null;

    // 视频页样式开关
    function enableWatchStyle() {
        if (!watchStyleEl) {
            watchStyleEl = document.createElement('style');
            watchStyleEl.id = 'yt-watch-style';
            watchStyleEl.textContent = watchCss;
            (document.head || document.documentElement).appendChild(watchStyleEl);
        }
    }
    function disableWatchStyle() {
        if (watchStyleEl) {
            watchStyleEl.remove();
            watchStyleEl = null;
        }
    }

    // 首页样式开关
    function enableHomeStyle() {
        if (!homeStyleEl) {
            homeStyleEl = document.createElement('style');
            homeStyleEl.id = 'yt-home-grid-style';
            homeStyleEl.textContent = homeCss;
            (document.head || document.documentElement).appendChild(homeStyleEl);
        }
    }
    function disableHomeStyle() {
        if (homeStyleEl) {
            homeStyleEl.remove();
            homeStyleEl = null;
        }
    }

    // 页面判断
    function isWatchPage() {
        return window.location.pathname.startsWith('/watch');
    }
    function isHomePage() {
        return window.location.pathname === '/';
    }

    function applyStyles() {
        // 视频页：开启视频样式，关闭首页样式
        if (isWatchPage()) {
            enableWatchStyle();
            disableHomeStyle();
        }
        // 首页：开启首页网格样式，关闭视频页样式
        else if (isHomePage()) {
            disableWatchStyle();
            enableHomeStyle();
        }
        // 其它页面（搜索/频道页等）全部关闭两套样式
        else {
            disableWatchStyle();
            disableHomeStyle();
        }
    }

    // 初始化
    applyStyles();

    // SPA跳转监听
    const observer = new MutationObserver(() => {
        applyStyles();
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();

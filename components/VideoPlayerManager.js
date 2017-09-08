/* globals VideoShortcutManager: FALSE */

/**
 * This component is responsible for behavior present in the video player that will be embedded within
 * the YouTube page.
 *
 * Inputs:
 *      - A video source
 *      - The outer div that the video player will be contained within
 *      - An interface manager, therefore, a YoutubeInterfaceManager object
 *
 * Results:
 *      - This component will create the video element and be responsible for all the behavior related to it.
 */

var VideoPlayerManager;

(function () {
    "use strict";

    VideoPlayerManager = function (videoLink, outerDiv, interfaceManager) {
        this.interfaceManager = interfaceManager;
        this.outerDiv = outerDiv;
        this.video = this.createVideoElement(videoLink);
        this.shortcutManager = new VideoShortcutManager(this.video);

        this.enableVisualFeedbacks();

        this.outerDiv.appendChild(this.video);
    };

    VideoPlayerManager.prototype.createVideoFunctions = function (video) {
        function roundBy2Decimals(number) {
            return Math.round(number * 100) / 100;
        }

        video.goForward = function (seconds) {
            this.currentTime += seconds;
        };

        video.goBack = function (seconds) {
            this.currentTime -= seconds;
        };

        video.togglePlayPause = function () {
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }

            this.dispatchEvent(new Event("togglePlayPause"));
        };

        video.goToSpecificTime = function (seconds) {
            this.currentTime = seconds;
        };

        video.increaseVolumeBy5Percent = function () {
            this.volume = Math.min(roundBy2Decimals(this.volume + 0.05), 1);
        };

        video.decreaseVolumeBy5Percent = function () {
            this.volume = Math.max(0, roundBy2Decimals(this.volume - 0.05));
        };

        video.increaseSpeed = function () {
            this.playbackRate = Math.min(this.playbackRate + 0.25, 2);
        };

        video.decreaseSpeed = function () {
            this.playbackRate = Math.max(0.25, this.playbackRate - 0.25);
        };

        video.toggleMuteUnmuteAudio = function () {
            this.muted = !this.muted;
        };

        video.isFullScreenModeEnabled = function () {
            // TO-DO: Will only work on Chrome
            return this.ownerDocument.webkitFullscreenElement !== null;
        };

        video.toggleFullScreenMode = function () {
            if (this.isFullScreenModeEnabled()) {
                this.exitFullScreenMode();
            } else {
                this.enterFullScreenMode();
            }
        };

        video.enterFullScreenMode = function () {
            if (this.webkitRequestFullscreen) {
                // Chrome & Opera
                this.webkitRequestFullScreen();
            } else if (this.mozRequestFullScreen) {
                // Firefox
                this.mozRequestFullScreen();
            } else if (this.msRequestFullscreen) {
                // Internet Explorer 11
                this.msRequestFullscreen();
            }
        };

        video.exitFullScreenMode = function () {
            if (this.ownerDocument.webkitExitFullscreen) {
                // Chrome & Opera
                this.ownerDocument.webkitExitFullscreen();
            } else if (this.ownerDocument.mozCancelFullScreen) {
                // Firefox
                this.ownerDocument.mozCancelFullScreen();
            } else if (this.ownerDocument.msExitFullscreen) {
                // Internet Explorer 11
                this.ownerDocument.msExitFullscreen();
            }
        };
    };

    VideoPlayerManager.prototype.createVideoElement = function (videoLink) {
        var videoTag = this.interfaceManager.document.createElement("video"),
            srcTag = this.interfaceManager.document.createElement("source"),
            self = this;

        videoTag.controls = true;
        videoTag.autoplay = true;
        videoTag.name = "media";
        videoTag.style.width = "100%";
        videoTag.id = "videoTag";
        videoTag.className = "video-stream html5-main-video";

        this.createVideoFunctions(videoTag);

        this.enableFullScreenModeOnDoubleClick(videoTag);

        this.enablePlayPauseVideoControlOnClick(videoTag);

        srcTag.src = videoLink;
        srcTag.type = "video/mp4";
        srcTag.onerror = function () {
            self.interfaceManager.showFailureMessage();
        };

        videoTag.appendChild(srcTag);

        return videoTag;
    };

    VideoPlayerManager.prototype.createVideoFrame = function () {
        return this.video;
    };

    VideoPlayerManager.prototype.enableVisualFeedbacks = function () {
        this.createAllFeedbackIcons();

        this.enablePlayPauseFeedback();
    };

    VideoPlayerManager.prototype.enablePlayPauseFeedback = function () {
        var self = this;

        this.video.addEventListener("togglePlayPause", function () {
            function updateVisualFeedback(isVideoPaused) {
                var feedback = self.interfaceManager.document.querySelector(isVideoPaused ? "#pauseFeedback" : "#playFeedback");

                feedback.style.cssText = '';

                setTimeout(function () {
                    feedback.style.cssText = "display: none;";
                }, 500);
            }

            updateVisualFeedback(this.paused);
        });
    };

    VideoPlayerManager.prototype.createAllFeedbackIcons = function () {
        var pauseFeedback = this.createFeedbackIcon('pauseFeedback', "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"),
            playFeedback = this.createFeedbackIcon('playFeedback', "M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z");

        this.outerDiv.appendChild(pauseFeedback);
        this.outerDiv.appendChild(playFeedback);
    };

    VideoPlayerManager.prototype.createFeedbackIcon = function (id, svgPath) {
        var div = this.interfaceManager.document.createElement("div");

        div.innerHTML = '<div id="' + id + '" class="ytp-bezel" role="status" data-layer="4" style="display: none;">' +
            '<div class="ytp-bezel-icon">' +
            '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">' +
            '<use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-id-' + id + '"></use>' +
            '<path class="ytp-svg-fill" d="' + svgPath + '" id="ytp-id-' + id + '"></path>' +
            '</svg>' +
            '</div>' +
            '</div>';

        return div.childNodes[0];
    };

    VideoPlayerManager.prototype.enablePlayPauseVideoControlOnClick = function (video) {
        video.addEventListener('click', function () {
            this.togglePlayPause();
        });
    };

    VideoPlayerManager.prototype.enableFullScreenModeOnDoubleClick = function (video) {
        video.addEventListener('dblclick', function () {
            if (this.isFullScreenModeEnabled()) {
                this.exitFullScreenMode();
            } else {
                this.enterFullScreenMode();
            }
        });
    };
}());

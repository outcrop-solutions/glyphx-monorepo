import { useState, useEffect, useCallback } from 'react';
import { QWebChannel } from 'qwebchannel';
import { glyphViewerDetails, orientationAtom } from '../state';
import { shareOpenAtom } from 'state/share';
import { showInfoAtom } from 'state/info';
import { showNotificationAtom } from 'state/notification';
import { useRecoilState, useRecoilValue } from 'recoil';
/**
 * To handle Socket Connection and Communications with Qt window
 * @param {boolean} isSelected
 * @returns {Object}
 */
export const useSocket = () => {
  // comments and filter sidebar positions
  // position state can be destructured as follows... { bottom, height, left, right, top, width, x, y } = position
  //position state dynamically changes with transitions

  const [glyphViewer, setGlyphViewer] = useRecoilState(glyphViewerDetails);

  const [commentsPosition, setCommentsPosition] = useState(null);
  const [filterSidebarPosition, setFilterSidebarPosition] = useState(null);
  const [sendDrawerPositionApp, setSendDrawerPositionApp] = useState(false);
  const [isSet, changeSet] = useState(false); // trying to limit number of times openSocket is ran to 1

  const isShareOpen = useRecoilValue(shareOpenAtom);
  const isInfoOpen = useRecoilValue(showNotificationAtom);
  const isNotifOpen = useRecoilValue(showInfoAtom);
  const orientation = useRecoilValue(orientationAtom);

  //   Create Socket
  const openSocket = useCallback(
    (baseUrl) => {
      let socket = new WebSocket(baseUrl);
      socket.onclose = function () {
        console.error('web channel closed');
      };
      socket.onerror = function (error) {
        console.error('web channel error: ' + error);
      };
      socket.onopen = function () {
        new QWebChannel(socket, function (channel) {
          window.core = channel.objects.core; // making it global
          try {
            window.core.KeepAlive.connect(function (message) {});
            window.core.GetDrawerPosition.connect(function (message) {});
            window.core.SendDrawerStatus.connect(function (message) {});
            window.core.SendSdtName.connect(function (message) {});
            window.core.SendCameraPosition.connect(function (message) {});

            setGlyphViewer({
              // set to true to signify we are ready to go
              ...glyphViewer,
              sendDrawerPositionApp: true,
            });
          } catch (error) {}
          //   try {
          //     // make core object accessible globally
          //     //window.core = channel.objects.core;
          //     //window.core.KeepAlive.connect(function (message) {
          //       //Issued every 30 seconds from Qt to prevent websocket timeout
          //     });
          //     //window.core.GetDrawerPosition.connect(function (message) {
          //     });
          //     //core.ToggleDrawer("Toggle Drawer"); 	// A Show/Hide toggle for the Glyph Drawer
          //     //core.ResizeEvent("Resize Event");		// Needs to be called when sidebars change size
          //     //core.UpdateFilter("Update Filter");	// Takes a SQL query based on current filters
          //     //core.ChangeState("Change State");		// Takes the Json information for the selected state
          //     //core.ReloadDrawer("Reload Drawer");	// Triggers a reload of the visualization currently in the drawer. This does not need to be called after a filter update.
          //   } catch (e) {
          //     console.error(e.message);
          //   }
        });
      };
    },
    [glyphViewer, setGlyphViewer]
  );

  useEffect(() => {
    if (!isSet) {
      //only runs if false
      changeSet(!isSet);
      var baseUrl = 'ws://localhost:12345';
      openSocket(baseUrl);
    }
  }, [isSet, openSocket]);

  //   Send Drawer position
  //   TODO: make our lives much easier by just setting fixed width header and sidebars
  useEffect(() => {
    if (glyphViewer.sendDrawerPositionApp) {
      var yValue = Math.round(window.innerHeight * 0.882);
      var heightValue = Math.round(window.innerHeight * 0.157);
      var leftValue = window.innerWidth;
      if (isShareOpen || isInfoOpen || isNotifOpen || true) {
        leftValue = window.innerWidth - 250;
      }

      try {
        window.core.SendDrawerPosition(
          JSON.stringify({
            filterSidebar: {
              y: yValue, //843
              right: 335,
              height: heightValue,
            },
            commentsSidebar: {
              left: leftValue,
            },
          })
        );
        setGlyphViewer({
          // set to false to signify we have already sent drawer positions
          ...glyphViewer,
          sendDrawerPositionApp: false,
        });
      } catch (error) {}
    }
  }, [glyphViewer, isInfoOpen, isNotifOpen, isShareOpen, setGlyphViewer]); //commentsPosition, filterSidebarPosition, sendDrawerPositionApp
};

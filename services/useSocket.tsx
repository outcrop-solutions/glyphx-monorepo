import { useState, useEffect } from "react";
import QWebChannel from "qwebchannel";
import { glyphViewerDetails } from "../state";
import { useRecoilState } from "recoil";
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

  //   Create Socket
  const openSocket = (baseUrl) => {
    let socket = new WebSocket(baseUrl);
    socket.onclose = function () {
      console.error("web channel closed");
    };
    socket.onerror = function (error) {
      console.error("web channel error: " + error);
    };
    socket.onopen = function () {
      console.log("WebSocket connected, setting up QWebChannel.");
      //   @ts-ignore
      new QWebChannel.QWebChannel(socket, function (channel) {
        try {
          // make core object accessible globally
          //   @ts-ignore
          window.core = channel.objects.core;
          //   @ts-ignore
          window.core.KeepAlive.connect(function (message) {
            //Issued every 30 seconds from Qt to prevent websocket timeout
            console.log(message);
          });
          //   @ts-ignore
          window.core.GetDrawerPosition.connect(function (message) {
            setGlyphViewer({
              ...glyphViewer,
              sendDrawerPositionApp: true
            });
          });
          //core.ToggleDrawer("Toggle Drawer"); 	// A Show/Hide toggle for the Glyph Drawer
          //core.ResizeEvent("Resize Event");		// Needs to be called when sidebars change size
          //core.UpdateFilter("Update Filter");	// Takes a SQL query based on current filters
          //core.ChangeState("Change State");		// Takes the Json information for the selected state
          //core.ReloadDrawer("Reload Drawer");	// Triggers a reload of the visualization currently in the drawer. This does not need to be called after a filter update.
        } catch (e) {
          console.error(e.message);
        }
      });
    };
  };

  useEffect(() => {
    var baseUrl = "ws://localhost:12345";
    openSocket(baseUrl);
  }, []);

  //   Send Drawer position
  //   TODO: make our lives much easier by just setting fixed width header and sidebars
  useEffect(() => {
    console.log("in set up in useSocket")
    // @ts-ignore
    console.log({glyphViewer})
    if (true ) {
      console.log("in setting width")
      try {
         // @ts-ignore
      window.core.SendDrawerPosition(
        JSON.stringify({
          filterSidebar: {
            y: 843, 
            right: 335,
            height: window.innerHeight,
          },
          commentsSidebar: {
            left: window.innerWidth
          },
        })
      );
      setGlyphViewer({
        ...glyphViewer,
        sendDrawerPositionApp: false
      });
      } catch (error) {
        console.log("useSocket UseEffect:",{error});
      }
    }
  }, []); //commentsPosition, filterSidebarPosition, sendDrawerPositionApp
};

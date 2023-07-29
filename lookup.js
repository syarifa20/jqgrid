serialize = function (obj, prefix = "") {
    var str = [];
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        var key = prefix ? prefix + "[" + p + "]" : p;
        var value = obj[p];
        if (typeof value === "object" && value !== null) {
          str.push(serialize(value, key));
        } else {
          str.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
        }
      }
    }
    return str.join("&");
  };
  
  const getLookup = function (fileName, postData) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${APP_URL}lookup/${fileName}?${serialize(postData)}`,
        method: "GET",
        dataType: "html",
        success: function (response) {
          resolve(response);
        },
      });
    });
  };
  
  $.fn.lookup = function (options) {
    let defaults = {
      title: null,
      fileName: null,
      beforeProcess: function () {},
      onShowLookup: function (rowData, element) {},
      onSelectRow: function (rowData, element) {},
      onCancel: function (element) {},
      onClear: function (element) {},
    };
  
    let settings = $.extend({}, defaults, options);
  
    this.each(function () {
      let element = $(this);
      let lookupContainer;
  
      element.wrap('<div class="input-group"></div>');
  
      let inputGroupAppend = $(
        '<div class="input-group-append"></div>'
      ).insertAfter(element);
  
      if (settings.onClear) {
        $(
          '<button type="button" class="btn position-absolute button-clear text-secondary" style="right: 34px; z-index: 99;"><i class="fa fa-times"></i></button>'
        )
          .appendTo(inputGroupAppend)
          .click(function () {
            handleOnClear(element);
          });
      }
  
      $(
        `<button class="btn btn-primary lookup-toggler" type="button"><i class="far fa-window-maximize text-easyui-dark" style="font-size: 12.25px"></i></button>`
      )
        .appendTo(inputGroupAppend)
        .click(async function () {
          const lookupContainer = element.siblings(
            `#lookup-${element.attr("id")}`
          );
          if (lookupContainer.is(":visible")) {
            lookupContainer.hide();
          } else {
            activateLookup(element, element.val());
          }
        });
  
      element.on("input", function (event) {
        activateLookup(element, element.val());
      });
    });
  
    async function activateLookup(element, searchValue = null) {
      settings.beforeProcess();
      settings.onShowLookup();
      let getId = element.attr("id");
  
      let lookupContainer = element.siblings(`#lookup-${getId}`);
  
      if (lookupContainer.length === 0) {
        lookupContainer = $(
          '<div id="lookup-' +
            getId +
            '" style="display: none; position: absolute; background-color: #fff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); z-index: 9999; top: 100%; left: 0; width: 100%; max-height: 600px; overflow-y: auto;"></div>'
        ).insertAfter(element);
      }
  
      lookupContainer.empty();
  
      let lookupBody = $('<div class="lookup-body"></div>').appendTo(
        lookupContainer
      );
  
      getLookup(settings.fileName, settings.postData ?? null).then((response) => {
        lookupBody.html(response);
  
        let grid = lookupBody.find(".lookup-grid");
  
        if (searchValue) {
          setTimeout(function () {
            var postData = grid.jqGrid("getGridParam", "postData"),
              colModel = grid.jqGrid("getGridParam", "colModel"),
              rules = [],
              searchText = element.val(),
              l = colModel.length,
              i,
              cm;
  
            for (i = 0; i < l; i++) {
              cm = colModel[i];
              if (
                cm.search !== false &&
                (cm.stype === undefined || cm.stype === "text")
              ) {
                grid.jqGrid("setGridParam", {
                  postData: {
                    filters: {
                      [cm.name]: `cn:${searchText}`,
                    },
                  },
                });
              }
            }
            postData.filter_group = "OR";
  
            grid.jqGrid("setGridParam", {
              search: true,
            });
            grid.trigger("reloadGrid", [
              {
                page: 1,
                current: true,
              },
            ]);
            return false;
          }, 300);
        }
  
        /* Determine user selection listener */
        if (detectDeviceType() == "desktop") {
          grid.jqGrid("setGridParam", {
            ondblClickRow: function (id) {
              handleSelectedRow(id, lookupContainer, element);
            },
            onSelectRow: function (id) {
              grid.keydown(function (e) {
                if (e.which === 13) {
                  handleSelectedRow(id, lookupContainer, element);
                }
              });
            },
          });
        } else if (detectDeviceType() == "mobile") {
          grid.jqGrid("setGridParam", {
            onSelectRow: function (id) {
              handleSelectedRow(id, lookupContainer, element);
            },
          });
        }
      });
  
      lookupContainer.show();
  
      lookupContainer.on("keydown", function (event) {
        if (event.keyCode === 27) {
          lookupContainer.hide();
        }
      });
    }
  
    function handleSelectedRow(id, lookupContainer, element) {
      if (id !== null) {
        let rowData = sanitize(
          lookupContainer.find(".lookup-grid").getRowData(id)
        );
        element.val(rowData.name);
        settings.onSelectRow(rowData, element);
        lookupContainer.hide();
      } else {
        alert("Please select a row");
      }
    }
  
    function handleOnCancel(element) {
      settings.onCancel(element);
    }
  
    function handleOnClear(element) {
      settings.onClear(element);
  
      let lookupContainer = element.siblings(`#lookup-${element.attr("id")}`);
      let grid = lookupContainer.find(".lookup-grid");
  
      grid.jqGrid("setGridParam", {
        postData: {
          filters: [],
        },
      });
  
      grid.trigger("reloadGrid", [{ page: 1, current: true }]);
    }
  
    function sanitize(rowData) {
      Object.keys(rowData).forEach((key) => {
        rowData[key] = rowData[key]
          .replaceAll('<span class="highlight">', "")
          .replaceAll("</span>", "");
      });
  
      return rowData;
    }
  
    return this;
  };
  
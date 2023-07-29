<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lookup</title>
</head>

<div>
    <table id="customerLookup" class="lookup-grid"></table>
</div>
<div id="pgridaco"></div>
</body>
<?= $this->renderSection('scripts') ?>

<script>
    $('#customerLookup').jqGrid({
            url: `${API_URL}/customer`,
            mtype: "GET",
            styleUI: "Bootstrap4",
            iconSet: "fontAwesome",
            datatype: "json",
            styleUI: "Bootstrap4",
            sortname: "code",
            colModel: [{
                    label: "ID",
                    name: "id",
                    width: "50px",
                    hidden: true,
                    sortable: false,
                    search: false,
                },
                {
                    label: "Code",
                    name: "code",
                    searchoptions: {
                        sopt: ['cn']
                    }
                },
                {
                    label: "Name",
                    name: "name",
                },
                {
                    label: "Contact",
                    name: "contactname",
                },
                {
                    label: "Description",
                    name: "description",
                },
                {
                    label: "Telephone",
                    name: "telephone",
                },
                {
                    label: "Address",
                    name: "address",
                },
                {
                    label: "City",
                    name: "city",
                },
                {
                    label: "Postal Code",
                    name: "postalcode",
                },
                {
                    label: "Status Aktif",
                    name: "status_aktif",
                },
                {
                    label: "Modified By",
                    name: "modified_by",
                },
                {
                    label: "Created At",
                    name: "created_at",
                    formatter: "date",
                    formatoptions: {
                        srcformat: "ISO8601Long",
                        newformat: "d-m-Y H:i:s",
                    },
                },
                {
                    label: "Updated At",
                    name: "updated_at",
                    formatter: "date",
                    formatoptions: {
                        srcformat: "ISO8601Long",
                        newformat: "d-m-Y H:i:s",
                    },
                },
            ],
            prmNames: {
                sort: "sort_index",
                order: "sort_order",
                rows: "limit",
            },
            jsonReader: {
                root: "data",
                total: "attributes.total_pages",
                records: "attributes.total_rows",
            },
            gridview: true,
            autowidth: true,
            scrollOffset: 1,
            scrollrows: true,
            shrinkToFit: false,
            height: 350,
            page: 1,
            rownumbers: true,
            rownumWidth: 45,
            rowNum: 10,
            rowList: [10, 20, 50, 0],
            toolbar: [true, "top"],
            viewrecords: true,
            selectedIndex: 0,
            triggerClick: true,
            serializeGridData: function(postData) {
                postData.sort_indexes = [postData.sort_index];
                postData.sort_orders = [postData.sort_order];


                delete postData.sort_index;
                delete postData.sort_order;

                return postData;
            },

            loadBeforeSend: function(jqXHR) {
                jqXHR.setRequestHeader('Authorization', `Bearer ${accessToken}`)

                setGridLastRequest($(this), jqXHR)

                var searchText = $('.customer-lookup').val()

            },
            onSelectRow: function(id) {
                activeGrid = this;

                let limit = $(this).jqGrid("getGridParam", "postData").limit;
                let page = $(this).jqGrid("getGridParam", "page");
                let selectedIndex = $(this).jqGrid("getCell", id, "rn") - 1;

                if (selectedIndex >= limit)
                    selectedIndex = selectedIndex - limit * (page - 1);

                $(this).jqGrid("setGridParam", {
                    selectedIndex,
                });
            },
            loadComplete: function(data) {

                changeJqGridRowListText();

                if (data.data.length === 0) {
                    $('#customerGrid').each((index, element) => {
                        abortGridLastRequest($(element))
                        clearGridHeader($(element))
                    })
                }

                $(this).parents(".ui-jqgrid").find("input").attr("autocomplete", "off");

                let selectedIndex = $(this).jqGrid("getGridParam").selectedIndex;

                if (selectedIndex > $(this).getDataIDs().length - 1) {
                    selectedIndex = $(this).getDataIDs().length - 1;
                }

                if ($(this).jqGrid("getGridParam").triggerClick) {
                    $(this)
						.find(`tr[id="${$(this).getDataIDs()[selectedIndex]}"]`)
						.click();

                    $(this).jqGrid("setGridParam", {
                        triggerClick: false,
                    });
                } else {

                    $(this).setSelection($(this).getDataIDs()[selectedIndex]);
                }


                $('#left-nav').find('button').attr('disabled', false)
                setHighlight(this);
            },

        })
        // // console.log(input)


        .jqGrid("setLabel", "rn", "No.")
        .bindKeys()
        .toolbarBindKeys()
        .customBindKeys()
        .loadClearFilter()
        .customPager();
</script>

</html>
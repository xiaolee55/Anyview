export function analyseToVisual(e) {
    console.log(e)
    var variate = e.content.variate;
    var visual_rough = variate.filter(function (item) {
        return item.type == "LinkList"
    });
   // console.log(visual_rough);   //截取所有type为linklist的数据

    //可视链表部分  删除掉p，q等指针
    var visual_rough_linklist = visual_rough.filter(function (item) {
        return item.innerObj !== ""
    })
    // console.log(visual_rough_linklist)
    //value: "0x0"

    //进行数据抽取分析
    var visual_node_list_assum = []
    for (let i in visual_rough_linklist) {
        var now = visual_rough_linklist[i].innerObj;
        var visual_node_list = [];
        while (now) {
            if (now.type == "LNode") {    //类型为LNode说明是一个结点，包括两个innerobj为data和指针
                var visual_node = {};
                visual_node.id = parseInt(now.value);
                visual_node.data = now.innerObj?now.innerObj[0].value:"";
                visual_node.next = now.innerObj?parseInt(now.innerObj[1].value):"";
                visual_node.root = false;
                //   visual_node.externalPointer = false;
                visual_node.addr = now.value;
                visual_node_list.push(visual_node);

            }
            now = now.innerObj[1].innerObj;


        }
        visual_node_list_assum.push(visual_node_list);
    }

    /*
        用一个数组记录出现过的结点
    */
    var id_number = 1, node_addr_count = [];
    for (var i in visual_node_list_assum) {
        for (var j in visual_node_list) {
            if (node_addr_count.indexOf(visual_node_list[j].addr) == -1) {

                node_addr_count.push(visual_node_list[j].addr);
            }
        }
    }


    for (var i in visual_node_list_assum) {
        var now_length = visual_node_list_assum[i].length;
        visual_node_list_assum[i][now_length - 1].next = null;
        visual_node_list_assum[i][0].root = true;

    }
    visual_node_list_assum[0].forEach(function (item) {
        delete item.addr;
    })

    console.log(visual_node_list_assum[0]);

    var list = visual_node_list_assum[0];
    console.log(list)
    return list;
}

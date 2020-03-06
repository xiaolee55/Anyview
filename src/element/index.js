import {Container,Header,Main,Footer,Form,FormItem,Button,Select, 
  Checkbox,Input,Message,Option,Row,Col,Dropdown,Avatar,DropdownItem,
  DropdownMenu,Card,Progress,Tag,Carousel,CarouselItem,Drawer,Switch,
  Collapse,CollapseItem,Loading,Tabs,TabPane,Alert,MessageBox,Popover,Cascader,Tree,Tooltip} from 'element-ui'

const element = {
  install: function(Vue) {
    Vue.use(Container)
    Vue.use(Header)
    Vue.use(Main)
    Vue.use(Footer)
    Vue.use(Form)
    Vue.use(FormItem)
    Vue.use(Button)
    Vue.use(Select)
    Vue.use(Checkbox)
    Vue.use(Input)
    Vue.use(Option)
    Vue.use(Row)
    Vue.use(Col)
    Vue.use(Dropdown)
    Vue.use(Avatar)
    Vue.use(DropdownItem)
    Vue.use(DropdownMenu)
    Vue.use(Card)
    Vue.use(Progress)
    Vue.use(Tag)
    Vue.use(Carousel)
    Vue.use(CarouselItem)
    Vue.use(Drawer)
    Vue.use(Switch)
    Vue.use(Collapse)
    Vue.use(CollapseItem)
    Vue.use(Loading)
    Vue.use(Tabs)
    Vue.use(TabPane)
    Vue.use(Popover)
    Vue.use(Cascader)
    Vue.use(Tree)
    Vue.use(Tooltip)
    Vue.prototype.$message = Message;
    Vue.prototype.$confirm = MessageBox.confirm;
  }
}

export default element


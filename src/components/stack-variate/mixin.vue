
<script>
import  Velocity from 'velocity-animate'
import {mapGetters,mapMutations,mapActions} from 'vuex'

export default {
  data() {
    return {
      defaultProps: {   //定义树的默认结构
        children: 'varChild',
        label: 'varInfo'
      },  
    }
  },
  methods: {
    ...mapMutations({
      setChangeVarsArr :"SET_CHANGE_VARS_ARR",
    })
  },
  computed: {
    ...mapGetters([
      "currentDebug",
    ]),
  }
}
</script>
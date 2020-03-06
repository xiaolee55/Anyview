
<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'

export default {
  methods: {
    ...mapMutations({
      setChangeVarsArr :"SET_CHANGE_VARS_ARR",
    })
  },
  computed: {
    ...mapGetters([
      "currentDebug",
    ]),
  },
}
</script>
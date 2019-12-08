<template>
      <swiper :options="swiperOption" :style="{height:caculateHeight}">
        <swiper-slide></swiper-slide>
        <!-- <div class="swiper-pagination" slot="pagination"></div> -->
      </swiper>
</template>

<script>
  export default {
    props: {
      list: {
        type: Array,
        default: ()=>[]
      },
      limitNum: 3
    },
    data() {
      return {
        swiperOption: {
          slidesPerView: 3,
          spaceBetween: 0,
          direction: 'vertical',
          mousewheel: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: true
          }
        }
      }
    },
    computed: {
      caculateHeight(){
        return this.limitNum*26+'px'
      }
    },
  }
</script>
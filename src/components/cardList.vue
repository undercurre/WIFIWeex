<template>
  <div class="container">
    <text class="title">{{ title }}</text>
    <div class="cards">
      <div class="card" v-for="(item,index) in cards" :key="item.id" :class="[item.id === selected ? 'active' : 'unactive', index !== 0 ? 'hasMargin' : '']" @click="select(item)">
        <text class="cardText" :style="{color: index === selected ? '#FFFFFF' : '#666666'}">{{ item.name }}</text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "cardList",
  props: {
    title: {
      type: String,
      default: '标题'
    },
    cards: {
      type: Array,
      default: []
    },
    selected: {
      type: Number,
      default: 0
    }
  },
  methods: {
    select(item) {
      this.$emit('selectCard', item)
    }
  }
}
</script>

<style scoped>
.container {
  width: 686px;
  height: 222px;
  background-color: #FFFFFF;
  padding: 40px 32px;
  box-shadow: 0px 2px 20px 0px rgba(0,0,0,0.04);
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.title {
  height: 32px;
  line-height: 32px;
  font-size: 32px;
  margin-bottom: 32px;
}

.cards {
  width: 622px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.card {
  flex: 1;
  height: 72px;
  border-radius: 36px;
  background-color: #F2F2F2;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.hasMargin {
  margin-left: 32px;
}

.active{
  background-color: #FFAA10;
}

.unactive{
  background-color: #F2F2F2;
}

.cardText {
  font-size: 28px;
  text-align: center;
  font-weight: 500;
}
</style>

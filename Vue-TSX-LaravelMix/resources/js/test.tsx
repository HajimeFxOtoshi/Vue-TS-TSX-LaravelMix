import { Component, Vue } from 'vue-property-decorator';
import { CreateElement, VNode } from 'vue';

@Component({
})
class Tmp extends Vue {
  render(h: CreateElement): VNode {
    return (
      <div id="first">
        First Div
        <div id="second">
            Second Div
          <div id="third">
            Third Div
          </div>
        </div>
      </div>
    );
  }
}

new Vue({
  render: (h: CreateElement) => <Tmp></Tmp>,
}).$mount('#app-root');

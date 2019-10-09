<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> 新闻管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <el-form :inline="true">
                <el-form-item label="新闻类别">
                    {{form.classid}}
                    <el-cascader v-model="form.classid" :options="treeData" :props="props" @change="handleChange"></el-cascader>
                    <!--<el-popover placement="right" trigger="click" v-model="classVisible">-->
                        <!--<el-tree :data="treeData" :default-expand-all="true" :highlight-current="true" :expand-on-click-node="false" :check-on-click-node="true" @node-click="selectClass"></el-tree>-->
                        <!--<el-button slot="reference">{{classPath}}</el-button>-->
                    <!--</el-popover>-->
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="openAddnews">新增新闻</el-button>
                </el-form-item>
            </el-form>
            <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="id" label="id" width="120"></el-table-column>
                <el-table-column prop="title" label="标题"></el-table-column>
                <el-table-column prop="tm" label="日期" sortable width="150"></el-table-column>
                <el-table-column label="操作">
                    <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="text" icon="el-icon-delete" class="red" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="total" :page-size="5">
                </el-pagination>
            </div>
        </div>
<!--添加新闻-->
        <el-dialog title="新增新闻" :visible.sync="addVisible" width="90%">
            <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="新闻类别">
                    {{classPath}}
                </el-form-item>
                <el-form-item label="新闻标题">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>
                <el-form-item label="新闻内容">
                    <quill-editor ref="myTextEditor" v-model="form.content" ></quill-editor>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="addNews">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import { quillEditor } from 'vue-quill-editor';
export default {
  name: "News",
  components: {
    quillEditor
  },
  data:function () {
    return {

      cur_page: 1,
      total:1,
      multipleSelection: [],

      props:{
        value:'id',
        emitPath:false,
      },
      classVisible:false,
      addVisible:false,
      form:{
        classid:0,
        title:'',
        content: '',
      },
      treeData:[{label:'全部分类',id:0}],
      classPath:'全部分类',
      tableData:[],
    }
  },
  created() {
    this.loadTreeData();
  },
  methods: {
    loadTreeData : function() {
      const _this = this;
      _this.$axios.get('/api/getClassTree').then(function (result) {
        if(result.data.flag){
          _this.$set(_this.treeData[0],'children',result.data.data);
          console.log(_this.treeData)
        }else{
          alert(result.data.msg)
        }
      });
    },
    // selectClass(data,node,obj){
    //   const arr = [];
    //   this.classVisible = false;
    //   this.form.classid = node.data.id;
    //   this.classPath = get(node);
    //   function get(a) {
    //     arr.push(a.label);
    //     if(a.parent.label){
    //       return get(a.parent)
    //     }else {
    //       return arr.reverse().join(' > ');
    //     }
    //   }
    // },
    openAddnews(){
      this.form.title='';
      this.form.content = '';
      this.addVisible=true;
    },
    addNews(){
      const _this = this;
      _this.$axios.post('/api/addnews',_this.form).then(function (result) {
        if(result.data.flag){
          _this.$message({
            type: 'success',
            message: '添加成功!'
          });
          _this.addVisible = false;
        }else{
          _this.$message({
            type: 'error',
            message: result.data.msg
          });
        }
      }).catch(()=>{});
    },
    handleChange(value){
      this.form.classid = value;
    },
    // 分页导航
    handleCurrentChange(val) {
      this.cur_page = val;
      this.getData();
    },
    // 获取 easy-mock 的模拟数据
    getData() {
      const _this = this;
      this.$axios.get('/api/newslist?page='+this.cur_page).then(function (result) {
        if(result.data.flag){
          _this.tableData = result.data.data;
          _this.total = result.data.data[0].total;
        }else{
          alert(result.data.msg);
          if(result.data.msg == '登陆超时'){
            localStorage.removeItem('ms_username');
            // this.$router.push('/login');
          }
        }
      },function () {

      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    delAll() {
      const _this = this;
      const delList = [];
      const cur_page = this.cur_page;
      for(let i=0;i<this.multipleSelection.length;i++){
        delList.push(this.multipleSelection[i].id)
      }
      this.$axios.post('http://127.0.0.1/api/delAll',{delList,cur_page}).then(function (result) {
        if(!result.data.flag){
          _this.$message.error(result.data.msg);
        }else{
          _this.$message.success('删除成功');
          _this.tableData = result.data.data;
          _this.total = result.data.data[0].total;
        }
      });
    },
  }
}
</script>

<style scoped>

</style>
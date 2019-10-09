<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> 管理员列表</el-breadcrumb-item>
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
            <el-table :data="tableData" border class="table" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="id" label="id" width="120"></el-table-column>
                <el-table-column prop="title" label="标题"></el-table-column>
                <el-table-column prop="tm" label="日期" sortable width="150"></el-table-column>


                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" icon="el-icon-delete" class="red" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="total" :page-size="5">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="60%">
            <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="新闻类别"></el-form-item>
                <el-form-item label="新闻标题">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>
                <el-form-item label="新闻内容">
                    <quill-editor ref="myTextEditor" v-model="form.content" ></quill-editor>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>
        <!--添加新闻-->
        <el-dialog title="新增新闻" :visible.sync="addVisible" width="60%">
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
  name: 'newclass',
  components: {
    quillEditor
  },
  data() {
    return {
      tableData: [],
      cur_page: 1,
      total:1,
      multipleSelection: [],
      select_word: '',
      del_list: [],
      is_search: false,
      editVisible: false,
      delVisible: false,
      form: {
        id:-1,
        title: '',
        content: '',
      },
      idx: -1,
      id:-1,


      props:{
        value:'id',
        emitPath:false,
      },
      classVisible:false,
      addVisible:false,
      form1:{
        classid:0,
        title:'',
        content: '',
      },
      treeData:[{label:'全部分类',id:0}],
      classPath:'全部分类',
    }
  },
  created() {
    this.getData();
    this.loadTreeData();
  },
  methods: {

    // 分页导航
    handleCurrentChange(val) {
      this.cur_page = val;
      this.getData();
    },
    // 获取全部新闻数据
    getData() {
      const _this = this;
      this.$axios.get('http://127.0.0.1/api/newslist?page='+this.cur_page).then(function (result) {
        if(result.data.flag){
          _this.tableData = result.data.data;
          _this.tableData.reverse();
          _this.total = result.data.data[0].total;
        }else{
          alert(result.data.msg);
          if(result.data.msg == '登陆超时'){
            localStorage.removeItem('ms_username');
            this.$router.push('/login');
          }
        }
      },function () {

      })
    },
    //获取树状图
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
    //新增新闻
    openAddnews(){
      this.form1.title='';
      this.form1.content = '';
      this.addVisible=true;
    },
    addNews(){
      const _this = this;
      _this.$axios.post('/api/addnews',_this.form1).then(function (result) {
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
    search() {
      this.is_search = true;
    },
    formatter(row, column) {
      return row.address;
    },
    filterTag(value, row) {
      return row.tag === value;
    },
    handleEdit(index, row) {
      this.form = {
        id:row.id,
        title: '',
        content: '',
      };
      this.editVisible = true;
    },
    handleDelete(index, row) {
      this.id = row.id;
      this.delVisible = true;
    },
    delAllnews() {
      const _this = this;
      const delList = [];
      const cur_page = this.cur_page;
      for(let i=0;i<this.multipleSelection.length;i++){
        delList.push(this.multipleSelection[i].id)
      }
      this.$axios.post('http://127.0.0.1/api/delAllnews',{delList,cur_page}).then(function (result) {
        if(!result.data.flag){
          _this.$message.error(result.data.msg);
        }else{
          _this.$message.success('删除成功');
          _this.tableData = result.data.data;
          _this.total = result.data.data[0].total;
        }
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 保存编辑
    saveEdit() {
      var _this = this;
      // this.editVisible = false;
      // this.$message.success(`修改第 ${this.idx+1} 行成功`);
      this.$axios.post('http://127.0.0.1/api/newsUpdate',this.form).then(function (result) {
        if(result.data.flag){
          _this.$message.success(`修改成功`);
          _this.getData();
        }else{
          _this.$message.success(result.data.msg);
        }
      },function (err) {
        _this.$message.success(err);
      }).finally(function () {
        _this.editVisible = false;
      })
    },
    // 确定删除
    deleteRow(){
      const _this = this;
      this.$axios.post('http://127.0.0.1/api/delnews',{id:_this.id,page:_this.cur_page}).then(function (result) {
        if(result.data.flag){
          _this.$message.success(`删除成功`);
          _this.tableData = result.data.data;
          _this.total = result.data.data[0].total;
        }else{
          _this.$message.success(result.data.msg);
        }
      },function (err) {
        _this.$message.error(err);
      }).finally(function () {
        _this.delVisible = false;
      })
    }
  }
}

</script>

<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
    .red{
        color: #ff0000;
    }
    .mr10{
        margin-right: 10px;
    }
</style>

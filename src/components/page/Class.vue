<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> 新闻分类</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <el-tree
                    :data="treeData"
                    default-expand-all
                    :highlight-current="true"
                    :expand-on-click-node="false"
                    :render-content="renderContent"
                    >
            </el-tree>
        </div>

        <el-dialog title="新增分类" :visible.sync="addVisible" width="30%">
            <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                <el-form-item label="上级分类">
                    {{form.path}}
                </el-form-item>
                <el-form-item label="分类名称" prop="title">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="addClass">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'class',
  data() {
    return {
      treeData:[{label:'新闻分类',id:0}],
      addVisible:false,
      form:{
        title:'',
        parentid:0,
        path:'',
      },
      rules:{
        title:[{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      }
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
        }else{
          alert(result.data.msg)
        }
      });
    },

    append(a,b,c) {
      const arr = [];
      this.form.path = get(a);
      this.form.parentid = a.data.id;
      this.form.title='';
      this.addVisible = true;

      function get(a) {
        arr.push(a.label);

        if(a.parent.label){
          return get(a.parent)
        }else {
          return arr.reverse().join(' > ');
        }
      }
      const newChild = { id: id++, label: 'testtest', children: [] };
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    addClass(){
      const _this = this;
      _this.$refs['form'].validate((valid) => {
        if (valid) {
          _this.$axios.get(`/api/addClass/${_this.form.parentid}/${_this.form.title}`).then(function (result) {
            if(result.data.flag){
              _this.$message({
                type: 'success',
                message: '添加成功!'
              });
              _this.loadTreeData();
              _this.addVisible = false;
            }else{
              _this.$message({
                type: 'error',
                message: result.data.msg
              });
            }
          });
        } else {
          return false;
        }
      });
      // if
    },
    remove(node, data) {
      const _this = this;
      _this.$confirm('此操作将永久删除这个分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        _this.$axios.get('/api/delClass/'+data.id).then(function (result) {
          if(result.data.flag){
            _this.$message({
              type: 'success',
              message: '删除成功!'
            });
            _this.loadTreeData();
            // _this.$set(_this.treeData[0],'children',result.data.data);
          }else{
            _this.$message({
              type: 'error',
              message: result.data.msg
            });
          }
        });
      }).catch(()=>{})
    },

    renderContent(h, { node, data, store }) {
      return (
        <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
        <span>
        <span>{node.label}</span>
        </span>
        <span>
        <el-button style="font-size: 12px;" type="text" on-click={ () => this.append(node,data,store) }>添加</el-button>
      <el-button style="font-size: 12px;" type="text" on-click={ () => this.remove(node, data) }>删除</el-button>
      </span>
      </span>);
    }
  }
}

</script>

<style scoped>

</style>

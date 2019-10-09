<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> 管理员列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="el-icon-delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
                <el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="id" label="id" width="120"></el-table-column>
                <el-table-column prop="uid" label="登录名"></el-table-column>
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="100px">
                <el-form-item label="新密码">
                    <el-input type="password" v-model="form.password"></el-input>
                </el-form-item>
                <el-form-item label="再次输入">
                    <el-input type="password" v-model="form.repassword"></el-input>
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
    </div>
</template>

<script>
    export default {
        name: 'adminList',
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
                    password: '',
                    repassword: '',
                },
                idx: -1,
                id:-1,
            }
        },
        created() {
            this.getData();
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                const _this = this;
                this.$axios.get('/api/adminList?page='+this.cur_page).then(function (result) {
                    if(result.data.flag){
                        _this.tableData = result.data.data;
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
                    password: '',
                    repassword: '',
                };
                this.editVisible = true;
            },
            handleDelete(index, row) {
                this.id = row.id;
                this.delVisible = true;
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
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 保存编辑
            saveEdit() {
                var _this = this;
                // this.editVisible = false;
                // this.$message.success(`修改第 ${this.idx+1} 行成功`);
                this.$axios.post('http://127.0.0.1/api/pwdUpdate',this.form).then(function (result) {
                    if(result.data.flag){
                        _this.$message.success(`修改成功`);
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
                this.$axios.post('http://127.0.0.1/api/deladmin',{id:_this.id,page:_this.cur_page}).then(function (result) {
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

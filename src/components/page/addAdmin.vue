<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-s-custom"></i> 管理员管理</el-breadcrumb-item>
                <el-breadcrumb-item>新增管理员</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="form-box">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="登录名">
                        <el-input v-model="form.uid"></el-input>
                    </el-form-item>
                    <el-form-item label="密码">
                        <el-input type="password" v-model="form.pwd"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">表单提交</el-button>
                        <el-button>取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

    </div>
</template>

<script>
    export default {
        name: 'addAdmin',
        data: function(){
            return {
                form: {
                    uid: '',
                    pwd: '',
                }
            }
        },
        methods: {
            onSubmit() {
                const _this = this;
                this.$axios.post('http://127.0.0.1/api/addAdmin',_this.form).then(function (result) {
                    if(result.data.flag){
                        _this.$message.success('添加成功！');
                        _this.form = {
                            uid: '',
                            pwd: '',
                        };
                    }else{
                        _this.$message.error(result.data.msg);
                    }
                },function (err) {
                    _this.$message.error(err);
                });

            }
        }
    }
</script>
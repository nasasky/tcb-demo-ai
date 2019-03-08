/* global wx, Component */
const MODES = ['GeneralBasicOCR', 'IDCardOCR']
import regeneratorRuntime from '../../libs/runtime'
import TcbService from '../../libs/tcb-service-mp-sdk/index'
const tcbService = new TcbService()

Component({
    data: {
        hasUploaded: false,
    },

    methods: {
        handleUploadTap() {
            this.uploadImage();
        },

        async handleRecognizeTap() {
            await this.callFunction();
        },

        uploadImage() {
            wx.chooseImage({
                success: (dRes) => {
                    wx.showLoading({
                        title: '上传中',
                    });

                    const fileName = dRes.tempFilePaths[0];
                    const dotPosition = fileName.lastIndexOf('.');
                    const extension = fileName.slice(dotPosition);
                    const cloudPath = `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}${extension}`;

                    wx.cloud.uploadFile({
                        cloudPath,
                        filePath: dRes.tempFilePaths[0],
                        success: (res) => {
                            this.setData({
                              fileID: res.fileID,
                              hasUploaded: true
                            }, () => {
                              wx.hideLoading()
                            });
                        },
                        fail: () => {
                            wx.hideLoading();
                            wx.showToast({
                                title: '上传失败',
                                icon: 'none',
                            });
                        },
                    });
                },
            });
        },

        async callFunction() {
            wx.showLoading({
                title: '识别中',
                icon: 'none',
            });

            let funcName = this.data.mode;
            if (MODES.indexOf(funcName) === -1) throw new Error(`未知识别模式: ${funcName}`);

            try {
              let result = await tcbService.callService({
                  service: 'ai',
                  action: funcName,
                  data: {
                    FileID: this.data.fileID
                  }
              })
              wx.hideLoading();

              if (!result.code && result.data) {
                this.triggerEvent('finish', result.data);
              }
              else {
                console.log(result);
                wx.showToast({
                  title: '识别失败',
                  icon: 'none',
                })
              }
            }
            catch (e) {
              wx.hideLoading();
              wx.showToast({
                title: '识别失败',
                icon: 'none',
              })
              console.log(e);
            }
        },
    },

    properties: {
        uploadText: {
            type: String,
            value: '上传图片',
        },
        recognizeText: {
            type: String,
            value: '识别图片',
        },
        imgUrl: {
            type: String,
            value: 'https://10.url.cn/eth/ajNVdqHZLLBn1TC6loURIX2GB5GB36NBNZtycXDXKGARFHnJwhHD8URMvyibLIRBTJrdcONEsVHc/',
        },
        mode: {
          type: String,
        },
    },
});

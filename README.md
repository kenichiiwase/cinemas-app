# 映画情報管理システム
映画情報をブックマークするwebシステム

## 機能
- ログイン処理  
- 映画情報の一覧表示処理  
- お気に入り映画登録処理  
- お気に入り映画削除処理

※詳細は右記リンク参照 [映画情報管理.pdf](https://github.com/kenichiiwase/cinemas-app/files/7179099/default.pdf)

## 動作環境  
- node 14.16.0  
- windows 10  

※Linux,Macでは対応未確認

## 環境インストール方法(Windows用)  
- node  
https://nodejs.org/ja にてNodeをインストールする  
- mongodb  
https://www.mongodb.com/try/download/community にてmongodbをインストールする  
インストール後の詳細設定は右記参照 [mongodb_setup_windows.pdf](https://github.com/kenichiiwase/cinemas-app/files/7147292/mongodb_setup.pdf)


## 実行方法  
1. `npm install`を実行  
2. https://www.themoviedb.org/?language=ja にアカウント登録し、APIキーを確認  
![スクリーンショット 2021-09-17 001037](https://user-images.githubusercontent.com/44935028/133637848-1d58c782-6245-4d8e-ab30-7906be613511.png)  
3. `cinemas-app/routes/cinemas.js`,`cinemas-app/routes/trends.js`へAPIキーを設定   
4. `npm run start`を実行  
5. `http://localhost:3000/`でアクセス  

# 映画情報管理システム
映画情報をブックマークするwebシステム

## 機能
- ログイン処理  
- 映画情報の一覧表示処理  
- お気に入り映画登録処理  
- お気に入り映画削除処理

※詳細は右記リンク参照 [映画情報取得システム.pdf](https://github.com/kenichiiwase/react-todo/files/7449288/default.pdf)

## 動作環境  
- node 14.16.0  
- windows 10  

※Linux,Macでは対応未確認

## 環境インストール方法(Windows用)  
- node  
https://nodejs.org/ja にてNodeをインストールする  
- mongodb  
https://www.mongodb.com/try/download/community にてmongodbをインストールする  
インストール後の詳細設定は右記参照 [mongodb_setup.pdf](https://github.com/kenichiiwase/cinemas-app/files/7237801/mongodb_setup.pdf)


## 実行方法  
1. `npm install`を実行  
2. https://www.themoviedb.org/?language=ja にアカウント登録し、APIキーを確認  
![スクリーンショット 2021-09-17 001037](https://user-images.githubusercontent.com/44935028/133637848-1d58c782-6245-4d8e-ab30-7906be613511.png)  
3. `cinemas-app/src/routes/cinemas.ts`,`cinemas-app/src/routes/trends.ts`へAPIキーを設定   
4. 環境変数を`.env`に設定  
![スクリーンショット 2021-09-30 001846](https://user-images.githubusercontent.com/44935028/135301128-1de12200-56f8-4e3a-a975-2c39b69ed5da.png)  
5. `npm run build`を実行  
6. `npm run start`を実行  
7. `http://localhost:3000/`でアクセス  

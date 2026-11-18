import UIKit
import WebKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = AppViewController()
        window.makeKeyAndVisible()
        self.window = window
        return true
    }
}

final class AppViewController: UIViewController, WKNavigationDelegate {
    private let webView = WKWebView(frame: .zero, configuration: WKWebViewConfiguration())
    private let progress = UIProgressView(progressViewStyle: .bar)
    private var progressObservation: NSKeyValueObservation?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        webView.translatesAutoresizingMaskIntoConstraints = false
        progress.translatesAutoresizingMaskIntoConstraints = false
        webView.navigationDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        view.addSubview(webView)
        view.addSubview(progress)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            progress.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            progress.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            progress.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        progressObservation = webView.observe(\.estimatedProgress, options: .new) { [weak self] webView, _ in
            self?.progress.progress = Float(webView.estimatedProgress)
            self?.progress.isHidden = webView.estimatedProgress >= 1
        }
        loadApp()
    }

    private func loadApp() {
        guard let url = URL(string: "https://marksheininwork-netizen.github.io/quotepilot/") else { return }
        webView.load(URLRequest(url: url, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30))
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showRetryIfNeeded(error)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showRetryIfNeeded(error)
    }

    private func showRetryIfNeeded(_ error: Error) {
        guard (error as NSError).code != NSURLErrorCancelled else { return }
        let alert = UIAlertController(title: "Can’t connect right now", message: "Check your internet connection and try again.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Try Again", style: .default) { [weak self] _ in self?.loadApp() })
        present(alert, animated: true)
    }
}

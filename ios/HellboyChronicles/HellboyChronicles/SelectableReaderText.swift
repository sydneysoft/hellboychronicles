import SwiftUI
import UIKit

struct SelectableReaderText: UIViewRepresentable {
    let text: String
    let language: ReaderLanguage
    @Binding var selectedWord: String?

    func makeCoordinator() -> Coordinator {
        Coordinator(selectedWord: $selectedWord)
    }

    func makeUIView(context: Context) -> UITextView {
        let view = UITextView()
        view.delegate = context.coordinator
        view.isEditable = false
        view.isSelectable = true
        view.isScrollEnabled = false
        view.backgroundColor = .clear
        view.textContainerInset = .zero
        view.textContainer.lineFragmentPadding = 0
        view.adjustsFontForContentSizeCategory = true
        view.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        return view
    }

    func updateUIView(_ view: UITextView, context: Context) {
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineSpacing = 8
        paragraph.paragraphSpacing = 18

        let descriptor = UIFontDescriptor.preferredFontDescriptor(withTextStyle: .body).withDesign(.serif)
            ?? UIFontDescriptor.preferredFontDescriptor(withTextStyle: .body)
        let font = UIFont(descriptor: descriptor, size: 22)
        let color = UIColor(red: 45/255, green: 34/255, blue: 24/255, alpha: 1)
        let attributed = NSAttributedString(
            string: text,
            attributes: [
                .font: font,
                .foregroundColor: color,
                .paragraphStyle: paragraph
            ]
        )
        if view.attributedText.string != text {
            view.attributedText = attributed
        }
        view.accessibilityLanguage = language.localeIdentifier
    }

    final class Coordinator: NSObject, UITextViewDelegate {
        private var selectedWord: Binding<String?>
        private var pending: DispatchWorkItem?

        init(selectedWord: Binding<String?>) {
            self.selectedWord = selectedWord
        }

        func textViewDidChangeSelection(_ textView: UITextView) {
            pending?.cancel()
            guard textView.selectedRange.length > 0,
                  let range = Range(textView.selectedRange, in: textView.text) else { return }

            let candidate = String(textView.text[range])
                .trimmingCharacters(in: .punctuationCharacters.union(.whitespacesAndNewlines))

            guard !candidate.isEmpty,
                  !candidate.contains(where: { $0.isWhitespace }) else { return }

            let work = DispatchWorkItem { [weak self] in
                self?.selectedWord.wrappedValue = candidate
            }
            pending = work
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.22, execute: work)
        }
    }
}
